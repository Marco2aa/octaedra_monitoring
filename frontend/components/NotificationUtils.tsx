// notificationUtils.ts

export const sendPushNotification = async (expoPushToken: string) => {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Packet Loss Alert",
    body: "The packet loss is 100%",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};
