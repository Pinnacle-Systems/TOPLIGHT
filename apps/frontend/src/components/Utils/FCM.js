export const _FCM_SENDER =async (ref_token,fcm,body,title)=>{
   var response=  await fetch('https://fcm.googleapis.com/v1/projects/serves-6870c/messages:send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ref_token}`,
    },
    body: JSON.stringify({
      message: {
        token: fcm,
        notification: {
          title: title ||  "Request",
          body: body
        },
        android: {
          priority: 'high',
          ttl: '3600s',
          notification: {
            channelId: 'high_priority_channel',
            sound: 'default',
            icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhk-tO9K6hGY9MvQO3q-gaUUIHnpjE4ZRabQ&s"
          }
        },
        data: {
          force_delivery: 'true',
          modalTrigger: "true"
        }
      }
    }),
  });
  
  return await response.json()
}