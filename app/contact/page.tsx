"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scissors, Phone, Mail, MapPin, Clock, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Bridal Blouse",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdfafb", color: "#1c1917", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f2e8ed",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/showcase" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
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
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/showcase" style={{ color: "#78716c", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Showcase
          </Link>
          <Link href="/about" style={{ color: "#78716c", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            About Us
          </Link>
          <Link href="/contact" style={{ color: "#be185d", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
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
            }}
          >
            <ShieldCheck size={16} color="#f472b6" /> Studio Portal
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#1c1917", marginBottom: "16px" }}>
            Contact & Atelier Appointments
          </h1>
          <p style={{ fontSize: "16px", color: "#78716c", maxWidth: "600px", margin: "0 auto" }}>
            Visit our design studio or send us your tailoring inquiries for custom designer wear.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
          {/* Studio Details */}
          <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #f2e8ed", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1c1917", marginBottom: "20px" }}>
              Studio Information
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <MapPin size={20} color="#be185d" style={{ marginTop: "3px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c1917" }}>Boutique Location</div>
                  <div style={{ fontSize: "13px", color: "#78716c", lineHeight: "1.5" }}>
                    No. 42, Designer Avenue, Anna Nagar,<br />Chennai, Tamil Nadu - 600040
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <Phone size={20} color="#be185d" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c1917" }}>Phone / WhatsApp</div>
                  <div style={{ fontSize: "13px", color: "#78716c" }}>+91 98401 23456 / +91 98401 65432</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <Mail size={20} color="#be185d" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c1917" }}>Email Address</div>
                  <div style={{ fontSize: "13px", color: "#78716c" }}>appointments@jodesigners.com</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <Clock size={20} color="#be185d" style={{ marginTop: "3px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c1917" }}>Working Hours</div>
                  <div style={{ fontSize: "13px", color: "#78716c" }}>Monday - Saturday: 10:00 AM - 8:30 PM<br />Sunday: 11:00 AM - 6:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #f2e8ed", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1c1917", marginBottom: "20px" }}>
              Send an Inquiry
            </h2>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <CheckCircle2 size={44} color="#16a34a" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#166534", marginBottom: "8px" }}>
                  Message Received
                </h3>
                <p style={{ fontSize: "13.5px", color: "#4b5563", marginBottom: "16px" }}>
                  Thank you! Our master designer will contact you shortly to confirm your consultation.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e7e5e4",
                    backgroundColor: "#fdf2f8",
                    color: "#9d174d",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Service Interested In
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  >
                    <option value="Bridal Blouse">Bridal & Aari Embroidery Blouse</option>
                    <option value="Wedding Lehenga">Wedding & Reception Lehenga</option>
                    <option value="Salwar & Kurti">Custom Salwar & Anarkali</option>
                    <option value="Kids Couture">Kids Couture & Birthday Frock</option>
                    <option value="Twinning Set">Mother & Daughter Twinning Set</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                    Notes / Questions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your event date, style preference or custom tailoring needs"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4", fontSize: "14px" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: "#be185d",
                    color: "#ffffff",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Send size={16} /> Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: "#171118", color: "#fdf2f8", padding: "40px 32px 30px", borderTop: "1px solid #2d1e34", textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>JO DESIGNERS BOUTIQUE & ATELIER</div>
        <p style={{ fontSize: "13px", color: "#a8a29e", maxWidth: "600px", margin: "0 auto 16px" }}>
          Premium customized stitching, wedding lehengas, bridal blouses, and couture kids wear.
        </p>
        <div style={{ fontSize: "12px", color: "#78716c" }}>
          © 2026 JO Designers. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
