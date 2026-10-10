import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView, FlatList } from 'react-native';
import { WebView } from 'react-native-webview';
import OndutyRTk, { useGet_history_locationQuery, useGet_live_locationQuery, useGet_live_userQuery } from '../../../../redux/service/Onduty';
import { DateInput } from '../../../../ReusableComponents/inputs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { RestartApi } from '../../../Utils/RestartApi';
import tailwind from 'twrnc';

// Smoothing constants
const SMOOTHING_FACTOR = 0.3;
const MAX_INTERPOLATED_POINTS = 5;
const MIN_DISTANCE_FOR_INTERPOLATION = 0.002;
const POLLING_INTERVAL = 1000;

const LiveLocationTracker = () => {
    const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webviewRef = useRef(null);
  const [viewMode, setViewMode] = useState('live'); 
  const [openedHistory, setOpenHistory] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [liveLocation, setLiveLocation] = useState(null);
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [mapType, setMapType] = useState('standard');
  const {data: user_live_data} = useGet_live_userQuery();
  const dispatch = useDispatch();
  const [selectedTrackerId, setSelectedTrackerId] = useState(UserSelect?.UserId || null);
  const [lastLocationTime, setLastLocationTime] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(16);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const lastLocationTimeRef = useRef(null);

  const { 
    data: liveData, 
    isLoading: liveLoading, 
    error: liveError,
    refetch: refetchLive 
  } = useGet_live_locationQuery(
    { userId: selectedTrackerId }, 
    {
      pollingInterval: viewMode === 'live' ? POLLING_INTERVAL : 0,
      skip: !selectedTrackerId || viewMode !== 'live'
    }
  );


  const { 
    data: historydata, 
    isLoading: historyLoading, 
    error: historyError ,
    refetch:live_his_refetch
  } = useGet_history_locationQuery({ 
    date: moment(date || new Date()).format("YYYY-MM-DD") 
  });

  useEffect(()=>{
   live_his_refetch()
   if(date===null){
    setDate(new Date())
   }
  },[])

  // Handle connection status changes
  useEffect(() => {
    if (liveData) {
      setConnectionStatus('connected');
    } else if (liveError) {
      setConnectionStatus('error');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [liveData, liveError]);

  // Auto-retry mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTrackerId && !liveData && !liveLoading) {
        refetchLive();
      }
    }, 10000); // Retry every 10 seconds if no data
    
    return () => clearInterval(interval);
  }, [selectedTrackerId, liveData, liveLoading]);

  // Reset tracking when changing trackers
  useEffect(() => {
    if (selectedTrackerId) {
      setLiveLocation(null);
      setRouteHistory([]);
      lastLocationTimeRef.current = null;
      refetchLive();
    }
  }, [selectedTrackerId]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Create intermediate points for smoother animation
  const interpolatePoints = (prevPoint, currentPoint) => {
    const distance = calculateDistance(
      prevPoint.latitude,
      prevPoint.longitude,
      currentPoint.latitude,
      currentPoint.longitude
    );
    
    if (distance < MIN_DISTANCE_FOR_INTERPOLATION) {
      return [currentPoint];
    }
    
    const steps = Math.min(
      Math.floor(distance / MIN_DISTANCE_FOR_INTERPOLATION),
      MAX_INTERPOLATED_POINTS
    );
    
    const interpolated = [];
    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1);
      interpolated.push({
        latitude: prevPoint.latitude + (currentPoint.latitude - prevPoint.latitude) * ratio,
        longitude: prevPoint.longitude + (currentPoint.longitude - prevPoint.longitude) * ratio,
        timestamp: new Date(
          prevPoint.timestamp.getTime() + 
          (currentPoint.timestamp.getTime() - prevPoint.timestamp.getTime()) * ratio
        ).toISOString()
      });
    }
    
    return [...interpolated, currentPoint];
  };

 
  useEffect(() => {
    if (liveData?.length>0  && viewMode === 'live' && selectedTrackerId) {
     
      const newLocationTimestamp = liveData[0].timestamp;
      
      // Prevent redundant processing if GPS data hasn't advanced
      if (lastLocationTimeRef.current === newLocationTimestamp) {
        return;
      }
      lastLocationTimeRef.current = newLocationTimestamp;

      const newLocation = {
        ...liveData?.[0],
        timestamp: new Date(newLocationTimestamp)
      };
      
      setLiveLocation(prev => {
        if (prev) {
          newLocation.latitude = prev.latitude + (newLocation.latitude - prev.latitude) * SMOOTHING_FACTOR;
          newLocation.longitude = prev.longitude + (newLocation.longitude - prev.longitude) * SMOOTHING_FACTOR;
        }
        return newLocation;
      });

      setRouteHistory(prev => {
        const newHistory = [...prev];
        if (prev.length > 0) {
          // Add interpolated points between last and current position
          const interpolated = interpolatePoints(prev[prev.length - 1], newLocation);
          newHistory.push(...interpolated);
        } else {
          newHistory.push(newLocation);
        }
        return newHistory;
      });

      if (webviewRef.current) {
        const updateScript = `
          try {
            if (!window.liveMarker) {
              window.liveMarker = L.marker([${newLocation.latitude}, ${newLocation.longitude}], {
                icon: L.divIcon({
                  className: 'live-marker',
                  html: '<div style="width: 24px; height: 24px; background: #FF5722; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                  iconSize: [24, 24]
                })
              }).addTo(map).bindPopup("Current Location");
              
              window.liveMarker.setLatLng([${newLocation.latitude}, ${newLocation.longitude}], {
                duration: 1000,
                easeLinearity: 0.25
              });
            } else {
              window.liveMarker.slideTo(
                [${newLocation.latitude}, ${newLocation.longitude}], 
                {duration: 1000}
              );
              
              const lastPos = window.lastPos || [${newLocation.latitude}, ${newLocation.longitude}];
              const dx = ${newLocation.latitude} - lastPos[0];
              const dy = ${newLocation.longitude} - lastPos[1];
              const predictedPos = [
                ${newLocation.latitude} + dx * 0.3,
                ${newLocation.longitude} + dy * 0.3
              ];
              
              window.liveMarker.setLatLng(predictedPos, {
                duration: 1000,
                easeLinearity: 0.25
              });
              
              window.lastPos = [${newLocation.latitude}, ${newLocation.longitude}];
            }
            
            if (!window.routePath) {
              window.routePath = L.polyline([], {
                color: '#4285F4',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round'
              }).addTo(map);
            }
            
            window.routePath.addLatLng([${newLocation.latitude}, ${newLocation.longitude}]);
            
            if (!window.userInteracted) {
              const currentZoom = map.getZoom();
              map.panTo([${newLocation.latitude}, ${newLocation.longitude}], {
                duration: 1000,
                easeLinearity: 0.25
              });
            }
            
            window.liveMarker.setPopupContent("Last update: ${new Date(newLocation.timestamp).toLocaleTimeString()}");
          } catch(e) {
            console.log('Marker update error:', e);
          }
          true;
        `;
        webviewRef.current.injectJavaScript(updateScript);
      }
    }
  }, [liveData, viewMode, selectedTrackerId]);

  useEffect(() => {
    if (routeHistory.length > 1) {
      let distance = 0;
      for (let i = 1; i < routeHistory.length; i++) {
        const prev = routeHistory[i-1];
        const curr = routeHistory[i];
        distance += calculateDistance(
          prev.latitude, 
          prev.longitude, 
          curr.latitude, 
          curr.longitude
        );
      }
      setTotalDistance(distance.toFixed(2)); 
    } else {
      setTotalDistance(0);
    }
  }, [routeHistory]);

  const MapTypeSelector = ({ mapType, setMapType }) => (
    <View style={styles.mapTypeContainer}>
      <TouchableOpacity 
        style={[styles.mapTypeButton, mapType === 'standard' && styles.activeMapType]}
        onPress={() => {
          setMapType('standard');
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`changeMapType('standard'); true;`);
          }
        }}
      >
        <Text style={mapType === 'standard' ? styles.activeMapTypeText : styles.mapTypeText}>Standard</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.mapTypeButton, mapType === 'satellite' && styles.activeMapType]}
        onPress={() => {
          setMapType('satellite');
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`changeMapType('satellite'); true;`);
          }
        }}
      >
        <Text style={mapType === 'satellite' ? styles.activeMapTypeText : styles.mapTypeText}>Satellite</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.mapTypeButton, mapType === 'terrain' && styles.activeMapType]}
        onPress={() => {
          setMapType('terrain');
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`changeMapType('terrain'); true;`);
          }
        }}
      >
        <Text style={mapType === 'terrain' ? styles.activeMapTypeText : styles.mapTypeText}>Terrain</Text>
      </TouchableOpacity>
    </View>
  );

  const openInGoogleMaps = (locations) => {
    if (!locations || locations.length === 0) {
      Alert.alert('Error', 'No location data available');
      return;
    }
    
    if (locations.length === 1) {
      const url = `https://www.google.com/maps?q=${locations[0].latitude},${locations[0].longitude}`;
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Could not open Google Maps');
      });
      return;
    }
    
    const origin = `${locations[0].latitude},${locations[0].longitude}`;
    const destination = `${locations[locations.length-1].latitude},${locations[locations.length-1].longitude}`;
    
    const waypoints = locations
      .slice(1, -1)
      .map(point => `${point.latitude},${point.longitude}`)
      .join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving${waypoints ? `&waypoints=${waypoints}` : ''}`;
    
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

  const selectedHistory = (docId) => {
    const foundData = historydata?.data?.find((data) => data[docId]); 
    if (foundData) {
      setRouteHistory(foundData[docId]);
      setOpenHistory(docId);
      setViewMode('history');
    }
  };

  const generateHtml = (locations) => {

  
    if (!locations || locations.length === 0 || !locations[0]?.latitude) {
      return '<html><body>No valid location data available</body></html>';
    }

    const tileLayers = {
      standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    }
    
    const initialCoords = locations[0];
    const locationCoords = locations?.filter(coord => coord?.latitude && coord?.longitude)
      ?.map(coord => [coord.latitude, coord.longitude]);
    
    if (locationCoords.length === 0) {
      return '<html><body>No valid coordinates to display</body></html>';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .info-panel {
            position: absolute;
            bottom: 20px;
            left: 10px;
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 12px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial;
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
          }
          .info-item { margin: 3px 0; }
          .action-btn {
            background: #4285F4;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            margin-top: 5px;
            cursor: pointer;
          }
          .live-marker {
            transition: transform 0.5s ease-out;
          }
          .live-marker.moving {
            transform: translate(-50%, -50%) scale(1.2);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="info-panel">
          <div class="info-item">${viewMode === 'live' ? 'Current Location' : 'Route History'}</div>
          ${viewMode === 'history' ? `
            <div class="info-item">Points: ${locationCoords.length}</div>
            <div class="info-item">Distance: ${totalDistance} km</div>
          ` : ''}
          <button class="action-btn" onclick="window.ReactNativeWebView.postMessage('open_gmaps')">
            Open in Google Maps
          </button>
        </div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          var map, currentTileLayer, liveMarker;
          var userInteracted = false;
          
          L.Marker.prototype.slideTo = function (newLatLng, options) {
            options = options || {};
            
            const duration = options.duration || 1000;
            const startLatLng = this.getLatLng();
            const startTime = performance.now();
            const self = this;
            
            function animate(time) {
              const elapsed = time - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              
              const lat = startLatLng.lat + (newLatLng.lat - startLatLng.lat) * easeProgress;
              const lng = startLatLng.lng + (newLatLng.lng - startLatLng.lng) * easeProgress;
              
              self.setLatLng([lat, lng]);
              
              if (progress < 1) {
                window.requestAnimationFrame(animate);
              }
            }
            
            window.requestAnimationFrame(animate);
          };
          
          function initMap() {
            try {
              map = L.map('map').setView([${initialCoords.latitude}, ${initialCoords.longitude}], ${currentZoom});
              changeMapType('${mapType}');
              
              ${viewMode === 'live' ? `
                liveMarker = L.marker([${initialCoords.latitude}, ${initialCoords.longitude}], {
                  icon: L.divIcon({
                    className: 'live-marker',
                    html: '<div style="width: 24px; height: 24px; background: #FF5722; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24]
                  })
                }).addTo(map).bindPopup("Current Location");
                
                window.routePath = L.polyline([], {
                  color: '#4285F4',
                  weight: 6,
                  opacity: 0.8,
                  lineJoin: 'round'
                }).addTo(map);
              ` : `
                var routePath = L.polyline(${JSON.stringify(locationCoords)}, {
                  color: '#4285F4',
                  weight: 6,
                  opacity: 0.8,
                  lineJoin: 'round'
                }).addTo(map);
                
                L.marker([${locationCoords[0][0]}, ${locationCoords[0][1]}], {
                  icon: L.divIcon({
                    className: 'start-marker',
                    html: '<div style="width: 24px; height: 24px; background: #4CAF50; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24]
                  })
                }).addTo(map).bindPopup("Start Point");
                
                L.marker([${locationCoords[locationCoords.length-1][0]}, ${locationCoords[locationCoords.length-1][1]}], {
                  icon: L.divIcon({
                    className: 'end-marker',
                    html: '<div style="width: 24px; height: 24px; background: #F44336; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24]
                  })
                }).addTo(map).bindPopup("End Point");
                
                map.fitBounds(routePath.getBounds(), { padding: [50, 50] });
              `}
              
              map.on('zoomstart dragstart', function() {
                userInteracted = true;
              });
              
              map.on('zoomend dragend', function() {
                setTimeout(() => { userInteracted = false; }, 5000);
              });
              
              map.on('zoomend', function() {
                window.ReactNativeWebView.postMessage('current_zoom:' + map.getZoom());
              });
            } catch (error) {
              console.error('Map initialization error:', error);
            }
          }
          
          function changeMapType(type) {
            if (currentTileLayer) {
              map.removeLayer(currentTileLayer);
            }
            
            const tileUrls = {
              standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
            };
            
            currentTileLayer = L.tileLayer(tileUrls[type], {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            window.ReactNativeWebView.postMessage('map_type_changed_' + type);
          }
          
          initMap();
        </script>
      </body>
      </html>
    `;
  };

 

  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    
    if (message === 'open_gmaps') {
      openInGoogleMaps(viewMode === 'live' ? [liveLocation] : routeHistory);
    } else if (message.startsWith('map_type_changed_')) {
      const newMapType = message.replace('map_type_changed_', '');
      setMapType(newMapType);
    } else if (message.startsWith('current_zoom:')) {
      const zoomLevel = parseFloat(message.replace('current_zoom:', ''));
      setCurrentZoom(zoomLevel);
    }
  };

  const renderLiveView = () => (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Live Location Tracking</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.switchButton, styles.historyButton]}
            onPress={() => setViewMode('history')}
          >
            <Text style={styles.switchButtonText}> View History</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {liveLoading && selectedTrackerId ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Getting live location...</Text>
        </View>
      ) : selectedTrackerId && liveLocation ? (
        <>
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: generateHtml([liveLocation]) }}
            style={styles.map}
            javaScriptEnabled={true}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => {
              if (webviewRef.current && routeHistory.length > 0) {
                const script = `
                  window.routePath.setLatLngs(${JSON.stringify(
                    routeHistory.map(loc => [loc.latitude, loc.longitude])
                  )});
                  true;
                `;
                webviewRef.current.injectJavaScript(script);
              }
            }}
          />
          <MapTypeSelector mapType={mapType} setMapType={setMapType} />
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialIcons 
                name="wifi" 
                size={18} 
                color={connectionStatus === 'connected' ? '#4CAF50' : 
                      connectionStatus === 'error' ? '#F44336' : '#FFC107'} 
              />
              <Text style={styles.infoText}>
                Status: {connectionStatus === 'connected' ? 'Connected' : 
                       connectionStatus === 'error' ? 'Error' : 'Connecting...'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="update" size={18} color="#555" />
              <Text style={styles.infoText}>
                Last updated: {moment(liveLocation.timestamp).format('HH:mm:ss')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color="#555" />
              <Text style={styles.infoText}>
                Points: {routeHistory.length}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="directions-car" size={18} color="#555" />
              <Text style={styles.infoText}>
                Distance: {totalDistance} km
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={() => {
              setSelectedTrackerId(null);
              setLiveLocation(null);
              setRouteHistory([]);
            }}
          >
            <Text style={styles.stopButtonText}>Stop Tracking</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.trackerListContainer}>
          <Text style={styles.subHeader}>Active Trackers</Text>
          <Text style={styles.subtitle}>Select a tracker to monitor live location</Text>
          
          {(user_live_data?.data?.length > 0 || user_live_data?.length > 0) ? (
            <FlatList
              data={user_live_data?.data || user_live_data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.trackerCard,
                    selectedTrackerId === item?.UserId && styles.selectedTrackerCard
                  ]}
                  onPress={() => setSelectedTrackerId(item?.UserId)}
                >
                  <View style={styles.trackerIcon}>
                  
                    <MaterialIcons name="location-on" size={24} color="#4285F4" />
                  </View>
                  <View style={styles.trackerInfo}>
                    <Text style={styles.trackerName}>Tracker ID: {item?.UserId}</Text>
                    <Text style={styles.trackerName}>Doc ID: {item?.docid}</Text>
                    <Text style={styles.trackerStatus}>
                      <Text style={styles.statusActive}>● Active</Text>
                    </Text>
                  </View>
                  <View style={styles.trackerAction}>
                    <MaterialIcons name="chevron-right" size={24} color="#999" />
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={<View style={styles.listFooter} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="location-off" size={48} color="#999" />
              <Text style={styles.emptyText}>No active trackers available</Text>
              <Text style={styles.emptySubtext}>Currently there are no trackers sending live data</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderHistoryView = () => {
    if (openedHistory === null) {
      return (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Location History</Text>
            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setViewMode('live')}
            >
               <MaterialIcons name="location-on" size={24} color="white" />
              <Text style={styles.switchButtonText}> View Live</Text>
            </TouchableOpacity>
          </View>
          
          <DateInput
            date={date} 
            setDate={setDate} 
            style={styles.datePicker}
          />
          
          {historyLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>Loading history data...</Text>
            </View>
          ) : !historydata?.meta || historydata.meta.length === 0 ? (
            <Text style={styles.noData}>No history data available for this date.</Text>
          ) : (
            <ScrollView>
              <View style={styles.historyList}>
                {historydata.meta.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.listItem}
                    onPress={() => selectedHistory(item)}
                  >
                    <Text style={styles.itemText}>Tracker ID: {item}</Text>
                    <Text style={styles.subText}>Tap to view route history</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Route History</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setOpenHistory(null)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        {routeHistory?.length > 0 ? (
          <>
            <WebView
              ref={webviewRef}
              originWhitelist={['*']}
              source={{ html: generateHtml(routeHistory) }}
              style={styles.map}
              javaScriptEnabled={true}
              onMessage={handleWebViewMessage}
              onLoadEnd={() => {
                if (webviewRef.current) {
                  webviewRef.current.injectJavaScript(`
                    map.setZoom(${currentZoom});
                    true;
                  `);
                }
              }}
            />
            <MapTypeSelector mapType={mapType} setMapType={setMapType} />
          </>
        ) : (
          <Text style={styles.noData}>No route data available</Text>
        )}
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            if (viewMode === 'live') {
              refetchLive();
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return viewMode === 'live' ? renderLiveView() : renderHistoryView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  switchButton: {
    backgroundColor: '#3186e0',
    padding: 8,
    borderRadius: 4,
    flexDirection:"row",
    gap:2,
    justifyContent:"center",
    paddingHorizontal:20
  },
  switchButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#757575',
    padding: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  listItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  map: {
    flex: 1,
    width: '100%',
    marginBottom: 8,
  },
  datePicker: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4285F4',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  trackerList: {
    flex: 1,
    paddingTop: 8,
  },
  historyList: {
    flex: 1,
    paddingTop: 8,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  mapTypeContainer: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 5,
    padding: 5,
    zIndex: 1000,
    flexDirection: "column",
  },
  mapTypeButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  activeMapType: {
    backgroundColor: '#4285F4',
  },
  mapTypeText: {
    fontSize: 12,
    color: '#333',
  },
  activeMapTypeText: {
    color: 'white',
  },
  trackerListContainer: {
    flex: 1,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  trackerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  selectedTrackerCard: {
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  trackerIcon: {
    backgroundColor: '#EBF2FF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trackerInfo: {
    flex: 1,
  },
  trackerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trackerStatus: {
    fontSize: 14,
    color: '#666',
  },
  statusActive: {
    color: '#4CAF50',
  },
  trackerAction: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  listFooter: {
    height: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  historyButton: {
    backgroundColor: '#6c757d',
  },
});

export default LiveLocationTracker;