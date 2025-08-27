import React from "react";
import Container from "../components/Container";
import Button from "../components/Button";
import GhostButton from "../components/GhostButton";

const Home = () => {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100">
        <Container className="grid min-h-[72vh] place-items-center py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Authentic culinary experience
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Cozy space • Unforgettable taste
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
              Book a table online in seconds. We'll be ready to welcome you.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                as="link"
                to="/reservation"
                className="px-6 py-3 text-base"
              >
                Book your table now
              </Button>
              <GhostButton
                as="link"
                to="/history"
                className="px-6 py-3 text-base"
              >
                View history
              </GhostButton>
            </div>
          </div>
        </Container>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-28 -top-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
      </section>

      {/* Highlights */}
      {/* <section className="bg-white py-16">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-semibold text-gray-900">
              Outstanding dish
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Exquisite flavors selected by the Chef
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Steak sốt tiêu", "Pasta kem nấm", "Tiramisu nhà làm"].map(
              (title, i) => (
                <article
                  key={i}
                  className="group overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="h-40 w-full bg-gradient-to-tr from-amber-100 via-amber-50 to-white" />
                  <div className="p-5">
                    <h3 className="text-lg text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Fresh ingredients • Prepared the same day
                    </p>
                    <div className="mt-4">
                      <GhostButton as="button" className="px-3 py-1.5">
                        See details
                      </GhostButton>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </Container>
      </section> */}
    </main>
  );
};

export default Home;
