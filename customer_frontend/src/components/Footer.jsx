import React from "react";
import Container from "./Container";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-amber-100 bg-white/70">
      <Container className="grid gap-6 py-10 md:grid-cols-3">
        <div>
          <div className="mb-2 font-serif text-lg">LeeHuFa Restaurant</div>
          <p className="text-sm text-gray-600">
            Exquisite cuisine • Cozy space
          </p>
        </div>
        <div className="text-sm text-gray-600">
          <div className="font-semibold text-gray-800">Contact</div>
          <p>Hotline: 0900 000 000</p>
          <p>Email: contact@nhahangabc.vn</p>
          <p>Address: 123 Pham Ngu Lao, District 1, TP.HCM</p>
        </div>
        <div className="text-sm text-gray-600">
          <div className="font-semibold text-gray-800">Opening hours</div>
          <p>Thứ 2 - CN: 09:00 - 22:00</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
