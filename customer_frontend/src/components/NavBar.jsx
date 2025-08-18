import React from "react";
import Container from "./Container";
import { Link } from "react-router-dom";
import GhostButton from "./GhostButton";
import Button from "./Button";

const NavBar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-100/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Container className="flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-xl text-gray-900"
        >
          <span className="text-2xl">🍽️</span>
          <span>LeeHuFa Restaurant</span>
        </Link>
        <nav className="flex items-center gap-2">
          <GhostButton as="link" to="/">
            Home page
          </GhostButton>
          <Button as="link" to="/reservation">
            Book a table
          </Button>
          <GhostButton as="link" to="/history">
            History
          </GhostButton>
        </nav>
      </Container>
    </header>
  );
};

export default NavBar;
