import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import Label from "../components/Label";
import Input from "../components/Input";
import Button from "../components/Button";
import GhostButton from "../components/GhostButton";
import TextArea from "../components/TextArea";

const ReservationPage = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    partySize: 2,
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // UI-only: show success panel. Replace with backend call later.
    setSubmitted(true);
    // Example next step after integrating BE: navigate(`/history?phone=${form.phone}`)
  };

  return (
    <main className="bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <Container className="py-12">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-gray-900">
                Book a table online
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Fill in the information below. We will hold your table for the
                time you choose.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="090xxxxxxx"
                      value={form.phone}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ban@email.com"
                      value={form.email}
                      onChange={onChange}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-3 sm:gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="partySize">Number of guests</Label>
                    <Input
                      id="partySize"
                      name="partySize"
                      type="number"
                      min={1}
                      value={form.partySize}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="note">Note</Label>
                  <TextArea
                    id="note"
                    name="note"
                    placeholder="Dị ứng, ghế trẻ em, kỷ niệm..."
                    value={form.note}
                    onChange={onChange}
                  />
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Button type="submit" className="px-6 py-3">
                    Book a table
                  </Button>
                  <GhostButton as="link" to="/history">
                    View history
                  </GhostButton>
                </div>
              </form>
            </div>
          </div>

          <aside className="md:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                <h3 className="font-serif text-lg text-gray-900">
                  Support information
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>• Hold table up to 30 minutes after reservation time.</li>
                  <li>• Free cancellation before arrival time.</li>
                  <li>• Contact: 0900 000 000</li>
                </ul>
              </div>

              {submitted && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
                  <div className="mb-1 font-semibold">
                    Booked table successfully
                  </div>
                  <p className="text-sm">
                    Your application is <b>pending</b> confirmation. You can
                    track the status in the History section.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      as="button"
                      className="px-3 py-2"
                      onClick={() =>
                        navigate(
                          `/history?phone=${encodeURIComponent(form.phone)}`
                        )
                      }
                    >
                      View history
                    </Button>
                    <GhostButton
                      as="button"
                      className="px-3 py-2"
                      onClick={() => setSubmitted(false)}
                    >
                      Close
                    </GhostButton>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
};

export default ReservationPage;
