"use client";

import { useState, useEffect } from "react";
import { Tag } from "lucide-react";

export default function OfferZone() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const offerEndDate = new Date();
    offerEndDate.setDate(offerEndDate.getDate() + 3);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = offerEndDate - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          days: days.toString().padStart(2, "0"),
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="offer-zone" id="offers">
      <div className="container">
        <h2>Special Offer Zone</h2>
        <p>Get up to 50% off on selected items. Limited time offer!</p>
        <div className="offer-timer">
          <div className="timer-box">
            <span>{timeLeft.days}</span>
            <p>Days</p>
          </div>
          <div className="timer-box">
            <span>{timeLeft.hours}</span>
            <p>Hours</p>
          </div>
          <div className="timer-box">
            <span>{timeLeft.minutes}</span>
            <p>Minutes</p>
          </div>
          <div className="timer-box">
            <span>{timeLeft.seconds}</span>
            <p>Seconds</p>
          </div>
        </div>
        <a
          href="#products"
          className="btn btn-outline"
          style={{ marginTop: "20px" }}
        >
          <Tag className="h-4 w-4" />
          View All Offers
        </a>
      </div>
    </section>
  );
}
