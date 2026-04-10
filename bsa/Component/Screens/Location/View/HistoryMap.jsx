import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useGet_history_locationQuery, useGet_live_locationQuery } from '../../../../redux/service/Onduty';
import { DateInput } from '../../../../ReusableComponents/inputs';
import moment from 'moment';

const LiveLocationTracker = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webviewRef = useRef(null);
 
  const [openedHistory, setOpenHistory] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
   const {data:live_location,isLoading:live_loading}=useGet_live_locationQuery()
  const [date,setDate]=useState(new Date())
 const { data: historydata, isLoading ,refetch} = useGet_history_locationQuery({date:moment(date).format("YYYY-MM-DD")});

 useEffect(()=>{
Alert.alert("",JSON?.stringify(live_location))
 },[live_loading])
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

 

  useEffect(()=>{
 refetch()
  },[date])

  // Calculate total distance of the route
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
    }
  }, [routeHistory]);

  // Set route history when data is fetched
  // useEffect(() => {
  //   if (historydata?.data) {
  //     // Ensure data is in correct format
  //     const formattedData = Array.isArray(historydata.data) 
  //       ? historydata.data 
  //       : [historydata.data];
  //     setRouteHistory(formattedData);
  //     setLoading(false);
  //   }
  // }, [historydata]);

  const openInGoogleMaps = () => {
    if (routeHistory.length < 2) {
      Alert.alert('Error', 'Not enough points to show route');
      return;
    }


    
    const origin = `${routeHistory[0].latitude},${routeHistory[0].longitude}`;
    const destination = `${routeHistory[routeHistory.length-1].latitude},${routeHistory[routeHistory.length-1].longitude}`;
    
    const waypoints = routeHistory
      .slice(1, -1)
      .map(point => `${point.latitude},${point.longitude}`)
      .join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&waypoints=${waypoints}`;
    
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

 const selectedHistory = (docId) => {
  
  const foundData = historydata?.data?.find((data)=>data[docId]); 
 
    setRouteHistory(foundData[docId]);
    setOpenHistory(docId);
    setLoading(false);
  
};


  const generateHtml = () => {
    if (routeHistory.length === 0 || !routeHistory[0]?.latitude) {
      return '<html><body>No valid route data available</body></html>';
    }
    
    const initialCoords = routeHistory[0];
    const routeCoords = routeHistory
      .filter(coord => coord?.latitude && coord?.longitude)
      .map(coord => [coord.latitude, coord.longitude]);
    
    if (routeCoords.length === 0) {
      return '<html><body>No valid coordinates to display</body></html>';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          html, body, #map { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
          }
          .route-info {
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
          .info-item {
            margin: 3px 0;
          }
          .open-gmaps-btn {
            background: #4285F4;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            margin-top: 5px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="route-info">
          <div class="info-item">Route History</div>
          <div class="info-item">Points: ${routeCoords.length}</div>
          <div class="info-item">Distance: ${totalDistance} km</div>
          <button class="open-gmaps-btn" onclick="window.ReactNativeWebView.postMessage('open_gmaps')">
            Open in Google Maps
          </button>
        </div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          try {
            // Initialize map centered on first coordinate
            var map = L.map('map').setView([${initialCoords.latitude}, ${initialCoords.longitude}], 16);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Create start marker
            L.marker([${routeCoords[0][0]}, ${routeCoords[0][1]}], {
              icon: L.divIcon({
                className: 'start-marker',
                html: '<div style="width: 24px; height: 24px; background: #4CAF50; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24]
              })
            }).addTo(map).bindPopup("Start Point");

            // Create end marker
            L.marker([${routeCoords[routeCoords.length-1][0]}, ${routeCoords[routeCoords.length-1][1]}], {
              icon: L.divIcon({
                className: 'end-marker',
                html: '<div style="width: 24px; height: 24px; background: #F44336; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24]
              })
            }).addTo(map).bindPopup("End Point");

            // Draw the route path
            var routePath = L.polyline(${JSON.stringify(routeCoords)}, {
              color: '#4285F4',
              weight: 6,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map);

            // Fit map to show entire route
            map.fitBounds(routePath.getBounds(), { padding: [50, 50] });
          } catch (error) {
            console.error('Map initialization error:', error);
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    if (event.nativeEvent.data === 'open_gmaps') {
      openInGoogleMaps();
    }
  };

  // if (isLoading || loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#4285F4" />
  //       <Text style={styles.loadingText}>Loading Route...</Text>
  //     </View>
  //   );
  // }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (openedHistory === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Location History</Text>
                   <DateInput
                            date={date} 
                            setDate={setDate} 
                            style={styles.datePicker}
                        />
        {!historydata?.meta || historydata.meta.length === 0 ? (
          <Text style={styles.noData}>No history data available.</Text>
        ) : (
          historydata.meta.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.listItem}
              onPress={() => selectedHistory(item)}
            >
              <Text style={styles.itemText}>Doc ID: {item}</Text>
              <Text style={styles.subText}>Tap to view route</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: generateHtml() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleWebViewMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(nativeEvent.description);
          setLoading(false);
        }}
        renderError={(errorName) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load map: {errorName}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
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
    height: '100%',
  },datePicker:{
    width:10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default LiveLocationTracker;