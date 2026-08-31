import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactClient from "./ContactClient";

export const revalidate = 0;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <ContactClient />
      </main>
      <Footer />
    </div>
  );
}
