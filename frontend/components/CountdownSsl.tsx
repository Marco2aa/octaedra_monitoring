import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

interface CountdownTimerProps {
  expirationDate: any;
  title: string; // Rendre la propriété expirationDate optionnelle
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expirationDate,
  title,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Fonction pour calculer le temps restant
  const calculateTimeRemaining = () => {
    if (!expirationDate) {
      setTimeRemaining("Date d'expiration manquante");
      return;
    }

    const expirationTime = new Date(expirationDate).getTime();
    const currentTime = new Date().getTime();
    let timeDifference = expirationTime - currentTime;

    if (timeDifference < 0) {
      // Si le temps est écoulé, afficher "Expiré"
      setTimeRemaining("Expiré");
    } else {
      // Convertir en jours, heures, minutes et secondes
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}:${hours}:${minutes}:${seconds}`);
    }
  };

  useEffect(() => {
    calculateTimeRemaining();

    // Mettre à jour le temps restant toutes les secondes
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationDate]); // Ajouter expirationDate comme dépendance

  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      <Text style={styles.timer}>{timeRemaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "green",
    borderRadius: 8,
    marginTop: 10,
  },
  timer: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default CountdownTimer;
