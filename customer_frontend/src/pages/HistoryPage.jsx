import Button from "../components/Button";
import Container from "../components/Container";
import GhostButton from "../components/GhostButton";
import Input from "../components/Input";
import Label from "../components/Label";
import StatusBadge from "../components/StatusBadge";

const HistoryPage = () => {
  const sample = [
    {
      id: "#A1B2C3",
      date: "2025-08-20",
      time: "19:00",
      partySize: 2,
      status: "Pending",
    },
    {
      id: "#D4E5F6",
      date: "2025-08-22",
      time: "12:30",
      partySize: 4,
      status: "Confirmed",
    },
    {
      id: "#G7H8I9",
      date: "2025-07-30",
      time: "18:00",
      partySize: 3,
      status: "Cancelled",
    },
  ];

  return (
    <main className="bg-white">
      <Container className="py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl text-gray-900">
                Table reservation history
              </h2>
              <p className="text-sm text-gray-600">
                Track the status of your table reservations.
              </p>
            </div>
            <GhostButton as="link" to="/reservation">
              Book a new table
            </GhostButton>
          </div>

          {/* Search bar (UI only) */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="search-phone">Phone number</Label>
                <Input id="search-phone" placeholder="090xxxxxxx" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="search-email">Email</Label>
                <Input
                  id="search-email"
                  type="email"
                  placeholder="ban@email.com"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Look up</Button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {sample.map((r) => (
              <article
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
              >
                <div className="grid gap-1">
                  <div className="text-sm text-gray-500">
                    Single code:{" "}
                    <span className="font-medium text-gray-800">{r.id}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Date and time:{" "}
                    <span className="font-medium">
                      {r.date} • {r.time}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Number of guests:{" "}
                    <span className="font-medium">{r.partySize}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  {r.status === "Pending" && (
                    <GhostButton className="px-3 py-1.5">
                      Cancel order
                    </GhostButton>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Empty state (show this when no booking) */}
          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-600">
            <div className="text-3xl">🗒️</div>
            <div className="mt-2 font-medium">No orders found yet</div>
            <div className="text-sm">
              Enter phone number or email to look up table reservation.
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default HistoryPage;
