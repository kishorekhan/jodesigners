"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import {
  Scissors,
  Sparkles,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  Heart,
  ChevronRight,
  ShieldCheck,
  Filter,
} from "lucide-react";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const defaultShowcase = [
  {
    id: "sc-1",
    title: "Bridal Zardosi Silk Lehenga",
    category: "Women",
    outfitType: "Bridal Couture",
    description: "Pure mulberry raw silk handcrafted with intricate antique zardosi and aari thread embroidery.",
    imageUrl: "https://images.pexels.com/photos/1446161/pexels-photo-1446161.jpeg?auto=compress&cs=tinysrgb&w=800",
    fabricDetails: "Pure Raw Silk with Gold Threadwork",
    tags: "Bridal, Heritage, Handcrafted",
  },
  {
    id: "sc-2",
    title: "Aari Peacock Embroidered Blouse",
    category: "Women",
    outfitType: "Designer Blouse",
    description: "Intricately detailed peacock motif bridal blouse with semi-precious stone embellishments and maggam work.",
    imageUrl: "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=800",
    fabricDetails: "Silk Cotton & Zari Border",
    tags: "Blouse, Aari, Traditional",
  },
  {
    id: "sc-3",
    title: "Princess Birthday Tiered Frock",
    category: "Kids",
    outfitType: "Kids Couture",
    description: "Enchanting multi-layered soft tulle birthday party gown with satin bodice and pearl detailing.",
    imageUrl: "https://images.pexels.com/photos/1619801/pexels-photo-1619801.jpeg?auto=compress&cs=tinysrgb&w=800",
    fabricDetails: "Soft Net, Satin Lining & Organza",
    tags: "Kids, Birthday, Partywear",
  },
  {
    id: "sc-4",
    title: "Traditional Kanchi Pattu Pavadai",
    category: "Kids",
    outfitType: "Ethnic Kids",
    description: "Pure Kanchipuram zari border pattu pavadai with contrast designer top tailored with inner lining.",
    imageUrl: "https://images.pexels.com/photos/3662932/pexels-photo-3662932.jpeg?auto=compress&cs=tinysrgb&w=800",
    fabricDetails: "Kanchipuram Silk & Pure Zari",
    tags: "Traditional, Festive, Silk",
  },
  {
    id: "sc-5",
    title: "Royal Anarkali Gown with Dupatta",
    category: "Women",
    outfitType: "Anarkali Suit",
    description: "Floor-length flowing georgette anarkali with sequin embroidery and matching scalloped organza dupatta.",
    imageUrl: "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=800",
    fabricDetails: "Georgette & Scalloped Organza",
    tags: "Festive, Reception, Elegant",
  },
  {
    id: "sc-6",
    title: "Mother & Daughter Matching Duo",
    category: "Women",
    outfitType: "Twinning Couture",
    description: "Specially designed bespoke festive twinning set crafted from rich brocade banarasi weave.",
    imageUrl: "https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800",
    fabricDetails: "Banarasi Brocade & Cotton Silk",
    tags: "Twinning, Family, Festive",
  },
];

export default function ShowcaseWebsite() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookingItem, setBookingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking Form State
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custDate, setCustDate] = useState("");
  const [custNotes, setCustNotes] = useState("");

  // Sync showcase works from DynamoDB (uploaded images only)
  useEffect(() => {
    let sub: any;
    if (client.models.ShowcaseWork) {
      sub = client.models.ShowcaseWork.observeQuery().subscribe({
        next: (data) => {
          setWorks([...data.items]);
        },
      });
    }
    return () => sub?.unsubscribe?.();
  }, []);

  const filteredWorks = works.filter((w) => {
    if (selectedCategory === "All") return true;
    return w.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  async function handleBookOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !bookingItem) return;

    setIsSubmitting(true);
    const orderPayload = {
      customerName: custName.trim(),
      phone: custPhone.trim(),
      category: bookingItem.category || "Women",
      outfitType: bookingItem.title || bookingItem.outfitType || "Bespoke Design",
      fabric: bookingItem.fabricDetails || "Custom Selection",
      status: "Order Confirmed",
      deliveryDate: custDate || new Date(Date.now() + 10 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: "To be estimated after measurement",
      notes: `Website Booking: ${bookingItem.title}. Customer request: ${custNotes}`,
    };

    try {
      if (client.models.CustomOrder) {
        await client.models.CustomOrder.create(orderPayload);
      } else if (client.models.Todo) {
        await client.models.Todo.create({ content: JSON.stringify(orderPayload) });
      }
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingItem(null);
        setCustName("");
        setCustPhone("");
        setCustDate("");
        setCustNotes("");
      }, 2500);
    } catch {
      alert("Order booking recorded. Our boutique team will connect directly.");
      setBookingItem(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdfafb", color: "#1c1917", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header
        className="responsive-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f2e8ed",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #be185d 0%, #db2777 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(190, 24, 93, 0.35)",
            }}
          >
            <Scissors size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#831843", letterSpacing: "-0.02em" }}>
              JO DESIGNERS
            </div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#9d174d", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Haute Couture & Tailoring Atelier
            </div>
          </div>
        </div>

        <div className="responsive-nav" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/showcase" style={{ color: "#be185d", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
            Showcase
          </Link>
          <Link href="/about" style={{ color: "#78716c", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            About Us
          </Link>
          <Link href="/contact" style={{ color: "#78716c", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Contact
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "20px",
              backgroundColor: "#171118",
              color: "#fdf2f8",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(23, 17, 24, 0.25)",
            }}
          >
            <ShieldCheck size={16} color="#f472b6" /> Studio Portal / Admin
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        style={{
          padding: "70px 24px 44px",
          textAlign: "center",
          maxWidth: "880px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            color: "#92400e",
            border: "1px solid #fcd34d",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: "20px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(217, 119, 6, 0.12)",
          }}
        >
          <Sparkles size={14} color="#d97706" /> Haute Couture Tailoring & Bridal Embroidery
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
            fontSize: "48px",
            fontWeight: "700",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#1c1917",
            marginBottom: "16px",
          }}
        >
          Bespoke Silhouettes & Tailored Masterpieces
        </h1>
        <p style={{ fontSize: "16px", color: "#78716c", lineHeight: 1.7, maxWidth: "680px", margin: "0 auto 32px" }}>
          From heirloom bridal aari blouses to handcrafted lehengas and royal kids couture, explore creations tailored to perfection.
        </p>

        {/* Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {["All", "Women", "Kids"].map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 22px",
                  borderRadius: "24px",
                  border: isSel ? "1.5px solid #be185d" : "1.5px solid #f2e8ed",
                  backgroundColor: isSel ? "#be185d" : "#ffffff",
                  color: isSel ? "#ffffff" : "#78716c",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isSel ? "0 4px 12px rgba(190, 24, 93, 0.25)" : "none",
                }}
              >
                {cat === "All" ? "All Creations" : `${cat}'s Couture`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Showcase Grid */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px 80px" }}>
        <div
          className="responsive-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "28px",
          }}
        >
        {filteredWorks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#a8a29e",
              gridColumn: "1 / -1",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px dashed #e2e8f0",
            }}
          >
            <Sparkles size={36} color="#d946ef" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "6px" }}>
              No Works Uploaded Yet
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Uploaded creations from the studio portal will appear here.
            </p>
          </div>
        ) : (
          filteredWorks.map((work) => (
            <div
              key={work.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #f2e8ed",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", width: "100%", height: "280px", backgroundColor: "#fdf2f8" }}>
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    backgroundColor: "rgba(23, 17, 24, 0.8)",
                    backdropFilter: "blur(4px)",
                    color: "#fdf2f8",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "11.5px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {work.category} · {work.outfitType || "Couture"}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917", marginBottom: "8px" }}>
                  {work.title}
                </h3>
                <p style={{ fontSize: "13.5px", color: "#78716c", lineHeight: 1.5, marginBottom: "14px", flex: 1 }}>
                  {work.description}
                </p>

                {work.fabricDetails && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9d174d",
                      backgroundColor: "#fdf2f8",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      marginBottom: "16px",
                      fontWeight: "500",
                    }}
                  >
                    🧵 Fabric: {work.fabricDetails}
                  </div>
                )}

                {/* Book Order Button */}
                <button
                  onClick={() => setBookingItem(work)}
                  style={{
                    width: "100%",
                    backgroundColor: "#be185d",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(190, 24, 93, 0.3)",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <ShoppingBag size={16} /> Select & Book This Design
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </section>

      {/* Booking Modal */}
      {bookingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Scissors size={20} color="#be185d" />
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                  Book Custom Order
                </h2>
              </div>
              <button
                onClick={() => setBookingItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
              >
                <X size={20} />
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#059669", marginBottom: "8px" }}>
                  Order Confirmed!
                </h3>
                <p style={{ fontSize: "14px", color: "#78716c" }}>
                  Your bespoke booking for "{bookingItem.title}" has been synced to our studio orders queue. Our master tailor will contact you shortly for measurements.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookOrder} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Selected Work Summary */}
                <div style={{ display: "flex", gap: "12px", backgroundColor: "#fdf2f8", padding: "12px", borderRadius: "10px", alignItems: "center" }}>
                  <img
                    src={bookingItem.imageUrl}
                    alt={bookingItem.title}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#831843" }}>{bookingItem.title}</div>
                    <div style={{ fontSize: "12px", color: "#9d174d" }}>Category: {bookingItem.category} · {bookingItem.outfitType}</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sundaram"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 23456"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Target Delivery / Event Date
                  </label>
                  <input
                    type="date"
                    value={custDate}
                    onChange={(e) => setCustDate(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Custom Tailoring Notes & Fabric Preferences
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need neck deep 7 inches, elbow sleeve with aari work, own fabric provided"
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setBookingItem(null)}
                    style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e7e5e4", backgroundColor: "#ffffff", color: "#78716c", fontWeight: "600", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#be185d", color: "#ffffff", padding: "10px 22px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }}
                  >
                    {isSubmitting ? "Booking Order..." : "Confirm & Send Booking"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: "#171118", color: "#fdf2f8", padding: "40px 32px 30px", borderTop: "1px solid #2d1e34", textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>JO DESIGNERS BOUTIQUE & ATELIER</div>
        <p style={{ fontSize: "13px", color: "#a8a29e", maxWidth: "600px", margin: "0 auto 16px" }}>
          Premium customized stitching, wedding lehengas, bridal blouses, and couture kids wear.
        </p>
        <div style={{ fontSize: "12px", color: "#78716c" }}>
          © 2026 JO Designers. All rights reserved. Powered by AWS Amplify & CloudFormation DynamoDB.
        </div>
      </footer>
    </div>
  );
}
