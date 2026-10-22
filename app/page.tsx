"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import {
  Scissors,
  Sparkles,
  Ruler,
  ShoppingBag,
  Users,
  Search,
  Bell,
  Plus,
  Trash2,
  Layers,
  Heart,
  Baby,
  Menu,
  Shirt,
  Eye,
  X,
  Palette,
  ShieldCheck,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  FolderPlus,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  LogOut,
  AlertCircle,
  Edit2,
  Upload,
  Image as ImageIcon,
  Globe,
} from "lucide-react";

Amplify.configure(outputs);

const client = generateClient<Schema>();

const PAGE_SIZE = 6;

function StudioDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation & UI States
  const [activeNav, setActiveNav] = useState("Custom Orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orderCategoryTab, setOrderCategoryTab] = useState<string>("All"); // "All" | "Women" | "Kids" | custom
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync activeNav with URL query param ?tab=
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const tabMap: Record<string, string> = {
        orders: "Custom Orders",
        measurements: "Measurement Book",
        fabrics: "Fabric & Embellishments",
        clients: "Client Directory",
        catalog: "Admin Catalog & Styles",
        showcase: "Work Showcase & Uploads",
      };
      if (tabMap[tabParam]) {
        setActiveNav(tabMap[tabParam]);
      }
    }
  }, [searchParams]);

  const navigateToTab = (tabName: string) => {
    setActiveNav(tabName);
    const slugMap: Record<string, string> = {
      "Custom Orders": "orders",
      "Measurement Book": "measurements",
      "Fabric & Embellishments": "fabrics",
      "Client Directory": "clients",
      "Admin Catalog & Styles": "catalog",
      "Work Showcase & Uploads": "showcase",
    };
    const slug = slugMap[tabName] || "orders";
    router.push(`/?tab=${slug}`, { scroll: false });
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  // Modals state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showFabricModal, setShowFabricModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAdminStyleModal, setShowAdminStyleModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Fitting trial for Bridal Silk Lehenga ready at 5:00 PM",
    "Fabric shipment: 30m Mulberry Silk checked in",
    "Measurement profile saved for Little Ananya (Princess Frock)",
  ]);

  // Admin Login State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [currentUserProfile, setCurrentProfile] = useState<{ name: string; email: string; role: string }>({
    name: "Studio Admin",
    email: "admin@jodesigners.com",
    role: "Administrator",
  });
  const [adminAuthMode, setAdminAuthMode] = useState<"signin" | "signup" | "confirm">("signin");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSignupName, setAdminSignupName] = useState("");
  const [adminSignupEmail, setAdminSignupEmail] = useState("");
  const [adminSignupPassword, setAdminSignupPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<Array<{ username: string; email: string; password: string }>>([]);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  // Default outfit styles
  const defaultStyles = [
    { id: "1", category: "Women", outfitStyle: "Bridal Lehenga & Blouse", basePrice: "₹ 15,000" },
    { id: "2", category: "Women", outfitStyle: "Aari Work Designer Blouse", basePrice: "₹ 3,500" },
    { id: "3", category: "Women", outfitStyle: "Anarkali Suit & Dupatta", basePrice: "₹ 5,000" },
    { id: "4", category: "Women", outfitStyle: "Western Evening Gown", basePrice: "₹ 8,500" },
    { id: "5", category: "Women", outfitStyle: "Salwar Kameez & Kurti", basePrice: "₹ 1,800" },
    { id: "6", category: "Kids", outfitStyle: "Kids Birthday Princess Frock", basePrice: "₹ 2,800" },
    { id: "7", category: "Kids", outfitStyle: "Traditional Pattu Pavadai (Girls)", basePrice: "₹ 3,200" },
    { id: "8", category: "Kids", outfitStyle: "Theme Party Fancy Dress", basePrice: "₹ 2,200" },
    { id: "9", category: "Kids", outfitStyle: "Kids Kurta Dhoti Set", basePrice: "₹ 2,500" },
    { id: "10", category: "Kids", outfitStyle: "Mother & Kid Matching Duo Set", basePrice: "₹ 7,500" },
  ];

  const [outfitConfigs, setOutfitConfigs] = useState<Array<any>>(defaultStyles);

  // Admin New Category & Style Form state
  const [adminNewCategory, setAdminNewCategory] = useState("");
  const [adminExistingCategory, setAdminExistingCategory] = useState("Women");
  const [adminCategoryMode, setAdminCategoryMode] = useState<"existing" | "new">("existing");
  const [adminNewStyle, setAdminNewStyle] = useState("");
  const [adminBasePrice, setAdminBasePrice] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [editingOutfitConfig, setEditingOutfitConfig] = useState<any | null>(null);

  // Data States bound to DynamoDB models
  const [orders, setOrders] = useState<Array<any>>([]);
  const [measurements, setMeasurements] = useState<Array<any>>([]);
  const [fabrics, setFabrics] = useState<Array<any>>([]);
  const [clients, setClients] = useState<Array<any>>([]);
  const defaultShowcaseWorks = [
    {
      id: "sc-1",
      title: "Bridal Zardosi Silk Lehenga",
      category: "Women",
      outfitType: "Bridal Couture",
      description: "Pure mulberry raw silk handcrafted with intricate antique zardosi and aari thread embroidery.",
      imageUrl: "https://images.pexels.com/photos/1446161/pexels-photo-1446161.jpeg?auto=compress&cs=tinysrgb&w=800",
      fabricDetails: "Pure Raw Silk with Gold Threadwork",
      imageKey: "work-showcase/bridal-lehenga.jpg",
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
      imageKey: "work-showcase/aari-blouse.jpg",
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
      imageKey: "work-showcase/princess-frock.jpg",
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
      imageKey: "work-showcase/pattu-pavadai.jpg",
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
      imageKey: "work-showcase/royal-anarkali.jpg",
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
      imageKey: "work-showcase/mother-daughter-duo.jpg",
      tags: "Twinning, Family, Festive",
    },
  ];

  const [showcaseWorks, setShowcaseWorks] = useState<Array<any>>([]);

  // Showcase Upload Modal State
  const [showWorkUploadModal, setShowWorkUploadModal] = useState(false);
  const [editingShowcaseWork, setEditingShowcaseWork] = useState<any | null>(null);
  const [workTitle, setWorkTitle] = useState("");
  const [workCategory, setWorkCategory] = useState("Women");
  const [workOutfitType, setWorkOutfitType] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [workFabric, setWorkFabric] = useState("");
  const [workImageUrl, setWorkImageUrl] = useState("");
  const [workImageKey, setWorkImageKey] = useState("");
  const [uploadingS3, setUploadingS3] = useState(false);

  // Form State: New Order
  const [orderCustomer, setOrderCustomer] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderCategory, setOrderCategory] = useState("None");
  const [orderOutfitType, setOrderOutfitType] = useState("None");
  const [orderFabric, setOrderFabric] = useState("");
  const [orderStatus, setOrderStatus] = useState("In Stitching");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Form State: Measurements
  const [measureClient, setMeasureClient] = useState("");
  const [measureCategory, setMeasureCategory] = useState("Women");
  const [bustChest, setBustChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [length, setLength] = useState("");
  const [armHole, setArmHole] = useState("");
  const [measureNotes, setMeasureNotes] = useState("");

  // Form State: Fabrics
  const [fabricMaterial, setFabricMaterial] = useState("");
  const [fabricColor, setFabricColor] = useState("");
  const [fabricMeters, setFabricMeters] = useState("");
  const [fabricType, setFabricType] = useState("Silk");

  // Form State: Clients
  const [clientFullName, setClientFullName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientStyle, setClientStyle] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Reset page and trigger smooth lazy loader when navigating or changing filters
  const [tableDataLoading, setTableDataLoading] = useState(true);

  useEffect(() => {
    setCurrentPage(1);
    setTableDataLoading(true);
    const timer = setTimeout(() => {
      setTableDataLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeNav, orderCategoryTab, searchQuery, statusFilter, currentPage]);

  const [authChecking, setAuthChecking] = useState(true);

  // Authentication check: strictly verify active session from Cognito User Pool
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const user = await getCurrentUser();
        if (user && user.userId) {
          setIsAdminLoggedIn(true);
          try {
            const attrs = await fetchUserAttributes();
            setCurrentProfile({
              name: attrs.name || attrs.email?.split("@")[0] || user.username || "Studio Admin",
              email: attrs.email || user.username || "admin@jodesigners.com",
              role: "Administrator",
            });
          } catch {
            setCurrentProfile({
              name: user.username || "Studio Admin",
              email: user.username || "admin@jodesigners.com",
              role: "Administrator",
            });
          }
        } else {
          setIsAdminLoggedIn(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("jo_admin_session");
          }
        }
      } catch {
        setIsAdminLoggedIn(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("jo_admin_session");
        }
      } finally {
        setAuthChecking(false);
      }
    }

    checkCurrentSession();
  }, []);

  // Subscribe to DynamoDB models
  useEffect(() => {
    let subConfigs: any;
    if (client.models.OutfitConfig) {
      subConfigs = client.models.OutfitConfig.observeQuery().subscribe({
        next: (data) => {
          if (data.items.length > 0) {
            setOutfitConfigs([...defaultStyles, ...data.items]);
          } else {
            setOutfitConfigs(defaultStyles);
          }
        },
      });
    }

    let subOrders: any;
    if (client.models.CustomOrder) {
      subOrders = client.models.CustomOrder.observeQuery().subscribe({
        next: (data) => {
          setOrders([...data.items]);
          setTableDataLoading(false);
        },
      });
    } else if (client.models.Todo) {
      subOrders = client.models.Todo.observeQuery().subscribe({
        next: (data) => {
          const parsed = data.items.map((i) => {
            try {
              return { id: i.id, ...JSON.parse(i.content || "{}") };
            } catch {
              return { id: i.id, customerName: i.content, category: "Women", outfitType: "Bespoke", status: "In Stitching" };
            }
          });
          setOrders(parsed);
          setTableDataLoading(false);
        },
      });
    }

    let subMeasurements: any;
    if (client.models.Measurement) {
      subMeasurements = client.models.Measurement.observeQuery().subscribe({
        next: (data) => setMeasurements([...data.items]),
      });
    }

    let subFabrics: any;
    if (client.models.FabricStock) {
      subFabrics = client.models.FabricStock.observeQuery().subscribe({
        next: (data) => setFabrics([...data.items]),
      });
    }

    let subClients: any;
    if (client.models.ClientProfile) {
      subClients = client.models.ClientProfile.observeQuery().subscribe({
        next: (data) => setClients([...data.items]),
      });
    }

    let subWorks: any;
    if (client.models.ShowcaseWork) {
      subWorks = client.models.ShowcaseWork.observeQuery().subscribe({
        next: async (data) => {
          const refreshedItems = await Promise.all(
            data.items.map(async (item: any) => {
              if (item.imageKey && item.imageKey.startsWith("work-showcase/")) {
                try {
                  const urlRes = await getUrl({ path: item.imageKey });
                  return { ...item, imageUrl: urlRes.url.toString() };
                } catch {
                  return item;
                }
              }
              return item;
            })
          );
          setShowcaseWorks(refreshedItems);
        },
      });
    }

    return () => {
      subConfigs?.unsubscribe?.();
      subOrders?.unsubscribe?.();
      subMeasurements?.unsubscribe?.();
      subFabrics?.unsubscribe?.();
      subClients?.unsubscribe?.();
      subWorks?.unsubscribe?.();
    };
  }, []);

  const availableCategories = Array.from(new Set(outfitConfigs.map((c) => c.category)));
  const availableStylesForCategory = outfitConfigs.filter((c) => c.category === orderCategory);

  // Admin authentication (Cognito User Pool Sign In & Sign Up)
  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    setIsAuthLoading(true);

    const emailOrUser = adminUsername.trim();

    try {
      const output = await signIn({
        username: emailOrUser,
        password: adminPassword,
      });

      if (output.isSignedIn) {
        setIsAdminLoggedIn(true);
        setShowLoginModal(false);
        try {
          const attrs = await fetchUserAttributes();
          setCurrentProfile({
            name: attrs.name || attrs.email?.split("@")[0] || emailOrUser,
            email: attrs.email || emailOrUser,
            role: "Administrator",
          });
        } catch {
          setCurrentProfile({
            name: emailOrUser.split("@")[0],
            email: emailOrUser,
            role: "Administrator",
          });
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("jo_admin_session", JSON.stringify({ authenticated: true, user: emailOrUser, timestamp: Date.now() }));
        }
        setNotifications((prev) => [`Signed in (${emailOrUser}) successfully`, ...prev]);
      } else if (output.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        setUnconfirmedEmail(emailOrUser);
        setAdminAuthMode("confirm");
        setAdminSuccess("Please enter the verification code sent to your email.");
      }
    } catch (err: any) {
      setAdminError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleAdminSignup(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");

    if (!adminSignupEmail.trim() || !adminSignupPassword) {
      setAdminError("Please fill in all required fields.");
      return;
    }
    if (adminSignupPassword !== adminConfirmPassword) {
      setAdminError("Passwords do not match.");
      return;
    }
    if (adminSignupPassword.length < 6) {
      setAdminError("Password must be at least 6 characters.");
      return;
    }

    setIsAuthLoading(true);

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: adminSignupEmail.trim(),
        password: adminSignupPassword,
        options: {
          userAttributes: {
            email: adminSignupEmail.trim(),
            name: adminSignupName.trim() || adminSignupEmail.split("@")[0],
          },
        },
      });

      if (isSignUpComplete) {
        setAdminSuccess("Account created successfully! Please sign in.");
        setAdminUsername(adminSignupEmail.trim());
        setAdminPassword(adminSignupPassword);
        setAdminAuthMode("signin");
      } else if (nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
        setUnconfirmedEmail(adminSignupEmail.trim());
        setAdminAuthMode("confirm");
        setAdminSuccess(`Verification code sent to ${adminSignupEmail.trim()}`);
      }
    } catch (err: any) {
      setAdminError(err.message || "Sign up failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    setIsAuthLoading(true);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: unconfirmedEmail,
        confirmationCode: confirmCode.trim(),
      });

      if (isSignUpComplete) {
        setAdminSuccess("Email verified successfully! You can now sign in.");
        setAdminUsername(unconfirmedEmail);
        setAdminAuthMode("signin");
      }
    } catch (err: any) {
      setAdminError(err.message || "Invalid verification code.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleLogout() {
    setIsAdminLoggedIn(false);
    try {
      await signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("jo_admin_session");
    }
    setNotifications((prev) => ["Logged out successfully", ...prev]);
  }

  // Admin: Add new style/category
  async function handleAdminAddOutfitConfig(e: React.FormEvent) {
    e.preventDefault();
    const finalCategory = adminCategoryMode === "new" ? adminNewCategory.trim() : adminExistingCategory.trim();
    if (!finalCategory || !adminNewStyle.trim()) return;

    const payload = {
      category: finalCategory,
      outfitStyle: adminNewStyle.trim(),
      description: adminDescription.trim() || `${finalCategory} designer attire`,
      basePrice: adminBasePrice.trim() || "₹ 3,500",
    };

    if (client.models.OutfitConfig) {
      await client.models.OutfitConfig.create(payload);
    } else {
      setOutfitConfigs((prev) => [{ id: Date.now().toString(), ...payload }, ...prev]);
    }

    setAdminNewStyle("");
    setAdminBasePrice("");
    setAdminDescription("");
    if (adminCategoryMode === "new") {
      setAdminNewCategory("");
      setAdminCategoryMode("existing");
    }
    setShowAdminStyleModal(false);
    setNotifications((prev) => [`New style "${payload.outfitStyle}" synced with DynamoDB`, ...prev]);
  }

  function handleStartEditOutfitConfig(config: any) {
    setEditingOutfitConfig(config);
    setAdminCategoryMode("existing");
    setAdminExistingCategory(config.category || "Women");
    setAdminNewStyle(config.outfitStyle || "");
    setAdminBasePrice(config.basePrice || "");
    setAdminDescription(config.description || "");
    setShowAdminStyleModal(true);
  }

  async function handleAdminSaveOutfitConfig(e: React.FormEvent) {
    e.preventDefault();
    if (editingOutfitConfig) {
      const finalCategory = adminCategoryMode === "new" ? adminNewCategory.trim() : adminExistingCategory.trim();
      if (!finalCategory || !adminNewStyle.trim()) return;

      const updatedPayload = {
        category: finalCategory,
        outfitStyle: adminNewStyle.trim(),
        description: adminDescription.trim() || `${finalCategory} designer attire`,
        basePrice: adminBasePrice.trim() || "₹ 3,500",
      };

      if (client.models.OutfitConfig) {
        try {
          await client.models.OutfitConfig.update({
            id: editingOutfitConfig.id,
            ...updatedPayload,
          });
        } catch {
          setOutfitConfigs((prev) =>
            prev.map((c) => (c.id === editingOutfitConfig.id ? { ...c, ...updatedPayload } : c))
          );
        }
      } else {
        setOutfitConfigs((prev) =>
          prev.map((c) => (c.id === editingOutfitConfig.id ? { ...c, ...updatedPayload } : c))
        );
      }

      setEditingOutfitConfig(null);
      setAdminNewStyle("");
      setAdminBasePrice("");
      setAdminDescription("");
      setShowAdminStyleModal(false);
      setNotifications((prev) => [`Updated style "${updatedPayload.outfitStyle}" successfully`, ...prev]);
    } else {
      await handleAdminAddOutfitConfig(e);
    }
  }

  // Admin: Delete an outfit style
  async function handleDeleteOutfitConfig(id: string) {
    if (client.models.OutfitConfig) {
      try {
        await client.models.OutfitConfig.delete({ id });
      } catch {
        setOutfitConfigs((prev) => prev.filter((c) => c.id !== id));
      }
    } else {
      setOutfitConfigs((prev) => prev.filter((c) => c.id !== id));
    }
  }

  // Showcase Work: S3 File Upload Handler
  async function handleFileUploadToS3(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingS3(true);
    const key = `work-showcase/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    try {
      const uploadTask = uploadData({
        path: key,
        data: file,
        options: {
          contentType: file.type || "image/jpeg",
        },
      });
      await uploadTask.result;
      const urlResult = await getUrl({
        path: key,
      });
      setWorkImageUrl(urlResult.url.toString());
      setWorkImageKey(key);
      setNotifications((prev) => [`Uploaded image to S3: ${file.name}`, ...prev]);
    } catch (err: any) {
      console.error("S3 upload error:", err);
      const objectUrl = URL.createObjectURL(file);
      setWorkImageUrl(objectUrl);
      setWorkImageKey(key);
      setNotifications((prev) => [
        `S3 Upload failed (${err?.message || "Storage error"}). Using local preview.`,
        ...prev,
      ]);
    } finally {
      setUploadingS3(false);
    }
  }

  // Showcase Work: Save or Replace Work
  async function handleSaveShowcaseWork(e: React.FormEvent) {
    e.preventDefault();
    if (!workTitle.trim() || !workImageUrl.trim()) return;

    const payload = {
      title: workTitle.trim(),
      category: workCategory,
      outfitType: workOutfitType.trim() || "Couture Design",
      description: workDescription.trim() || "Custom handcrafted designer piece",
      fabricDetails: workFabric.trim() || "Pure silk with embellishments",
      imageUrl: workImageUrl.trim(),
      imageKey: workImageKey || "work-showcase/uploaded",
      tags: `${workCategory}, Bespoke`,
    };

    if (editingShowcaseWork) {
      if (client.models.ShowcaseWork) {
        await client.models.ShowcaseWork.update({
          id: editingShowcaseWork.id,
          ...payload,
        });
      } else {
        setShowcaseWorks((prev) =>
          prev.map((w) => (w.id === editingShowcaseWork.id ? { ...w, ...payload } : w))
        );
      }
      setNotifications((prev) => [`Replaced showcase work "${payload.title}"`, ...prev]);
    } else {
      if (client.models.ShowcaseWork) {
        await client.models.ShowcaseWork.create(payload);
      } else {
        setShowcaseWorks((prev) => [{ id: Date.now().toString(), ...payload }, ...prev]);
      }
      setNotifications((prev) => [`Added new showcase work "${payload.title}"`, ...prev]);
    }

    setEditingShowcaseWork(null);
    setWorkTitle("");
    setWorkCategory("Women");
    setWorkOutfitType("");
    setWorkDescription("");
    setWorkFabric("");
    setWorkImageUrl("");
    setShowWorkUploadModal(false);
  }

  // Showcase Work: Delete Work
  async function handleDeleteShowcaseWork(work: any) {
    if (client.models.ShowcaseWork) {
      await client.models.ShowcaseWork.delete({ id: work.id });
    } else {
      setShowcaseWorks((prev) => prev.filter((w) => w.id !== work.id));
    }
    if (work.imageKey) {
      try {
        await remove({ path: work.imageKey });
      } catch {
        // ignore
      }
    }
    setNotifications((prev) => [`Deleted showcase item "${work.title}"`, ...prev]);
  }

  function handleStartEditShowcaseWork(work: any) {
    setEditingShowcaseWork(work);
    setWorkTitle(work.title || "");
    setWorkCategory(work.category || "Women");
    setWorkOutfitType(work.outfitType || "");
    setWorkDescription(work.description || "");
    setWorkFabric(work.fabricDetails || "");
    setWorkImageUrl(work.imageUrl || "");
    setShowWorkUploadModal(true);
  }

  // Create Order
  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderCustomer.trim()) return;

    const payload = {
      customerName: orderCustomer.trim(),
      phone: orderPhone.trim() || "+91 98401 23456",
      category: orderCategory,
      outfitType: orderOutfitType,
      fabric: orderFabric.trim() || "Client Provided Fabric",
      status: orderStatus,
      deliveryDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: orderAmount.trim() || "₹ 4,500",
      notes: orderNotes.trim() || "Bespoke pattern design",
    };

    if (client.models.CustomOrder) {
      await client.models.CustomOrder.create(payload);
    } else {
      await client.models.Todo.create({ content: JSON.stringify(payload) });
    }

    setOrderCustomer("");
    setOrderPhone("");
    setOrderCategory("None");
    setOrderOutfitType("None");
    setOrderFabric("");
    setOrderAmount("");
    setOrderNotes("");
    setShowOrderModal(false);
    setNotifications((prev) => [`New order booked for ${payload.customerName}`, ...prev]);
  }

  // Update Order Status
  async function handleUpdateOrderStatus(order: any, nextStatus: string) {
    if (client.models.CustomOrder) {
      await client.models.CustomOrder.update({ id: order.id, status: nextStatus });
    } else {
      await client.models.Todo.update({
        id: order.id,
        content: JSON.stringify({ ...order, status: nextStatus }),
      });
    }
    if (viewingItem?.id === order.id) {
      setViewingItem({ ...viewingItem, status: nextStatus });
    }
  }

  // Delete Order
  async function handleDeleteOrder(id: string) {
    if (client.models.CustomOrder) {
      await client.models.CustomOrder.delete({ id });
    } else {
      await client.models.Todo.delete({ id });
    }
    if (viewingItem?.id === id) setViewingItem(null);
  }

  // Save Measurement
  async function handleSaveMeasurement(e: React.FormEvent) {
    e.preventDefault();
    if (!measureClient.trim()) return;

    const payload = {
      clientName: measureClient.trim(),
      category: measureCategory,
      bustChest: bustChest.trim() || "36",
      waist: waist.trim() || "30",
      hip: hip.trim() || "40",
      shoulder: shoulder.trim() || "14.5",
      length: length.trim() || "44",
      armHole: armHole.trim() || "16",
      notes: measureNotes.trim(),
    };

    if (client.models.Measurement) {
      await client.models.Measurement.create(payload);
    }

    setMeasureClient("");
    setBustChest("");
    setWaist("");
    setHip("");
    setShoulder("");
    setLength("");
    setArmHole("");
    setMeasureNotes("");
    setShowMeasurementModal(false);
    setNotifications((prev) => [`Measurements saved for ${payload.clientName}`, ...prev]);
  }

  // Delete Measurement
  async function handleDeleteMeasurement(id: string) {
    if (client.models.Measurement) {
      await client.models.Measurement.delete({ id });
    }
  }

  // Add Fabric
  async function handleAddFabric(e: React.FormEvent) {
    e.preventDefault();
    if (!fabricMaterial.trim()) return;

    const payload = {
      materialName: fabricMaterial.trim(),
      colorShade: fabricColor.trim() || "Vibrant Tone",
      metersAvailable: fabricMeters.trim() || "10",
      type: fabricType,
    };

    if (client.models.FabricStock) {
      await client.models.FabricStock.create(payload);
    }

    setFabricMaterial("");
    setFabricColor("");
    setFabricMeters("");
    setShowFabricModal(false);
  }

  // Delete Fabric
  async function handleDeleteFabric(id: string) {
    if (client.models.FabricStock) {
      await client.models.FabricStock.delete({ id });
    }
  }

  // Register Client
  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!clientFullName.trim()) return;

    const payload = {
      fullName: clientFullName.trim(),
      phone: clientPhone.trim() || "+91 98401 99887",
      email: clientEmail.trim() || "client@boutique.com",
      preferredStyle: clientStyle.trim() || "Traditional Bridal & Handloom",
      address: clientAddress.trim() || "Chennai, India",
    };

    if (client.models.ClientProfile) {
      await client.models.ClientProfile.create(payload);
    }

    setClientFullName("");
    setClientPhone("");
    setClientEmail("");
    setClientStyle("");
    setClientAddress("");
    setShowClientModal(false);
    setNotifications((prev) => [`Client profile created for ${payload.fullName}`, ...prev]);
  }

  // Delete Client
  async function handleDeleteClient(id: string) {
    if (client.models.ClientProfile) {
      await client.models.ClientProfile.delete({ id });
    }
  }

  // Category counts
  const womenOrdersCount = orders.filter((o) => o.category === "Women").length;
  const kidsOrdersCount = orders.filter((o) => o.category === "Kids").length;

  // Nav Items - Consolidated single entry for all costume & tailoring orders
  const navItems = [
    { name: "Custom Orders", icon: ShoppingBag, badge: orders.length },
    { name: "Measurement Book", icon: Ruler, badge: measurements.length },
    { name: "Fabric & Embellishments", icon: Layers, badge: fabrics.length },
    { name: "Client Directory", icon: Users, badge: clients.length || orders.length },
    { name: "Admin Catalog & Styles", icon: ShieldCheck, badge: outfitConfigs.length },
    { name: "Work Showcase & Uploads", icon: Upload, badge: showcaseWorks.length },
  ];

  // Filtered Orders (Single Page with Women, Kids & All segment tabs)
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (orderCategoryTab !== "All") return o.category === orderCategoryTab;
        return true;
      })
      .filter((o) => (statusFilter === "All" ? true : o.status === statusFilter))
      .filter((o) =>
        (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.outfitType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.fabric || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [orders, orderCategoryTab, statusFilter, searchQuery]);

  // Filtered Measurements
  const filteredMeasurements = useMemo(() => {
    return measurements
      .filter((m) => (orderCategoryTab === "All" ? true : m.category === orderCategoryTab))
      .filter((m) =>
        (m.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [measurements, orderCategoryTab, searchQuery]);

  // Filtered Fabrics
  const filteredFabrics = useMemo(() => {
    return fabrics.filter(
      (f) =>
        (f.materialName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.colorShade || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.type || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fabrics, searchQuery]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    const list = clients.length > 0 ? clients : orders;
    return list.filter((c) =>
      ((c.fullName || c.customerName) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((c.preferredStyle || c.outfitType) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((c.phone || "")).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, orders, searchQuery]);

  // Filtered Admin Styles
  const filteredStyles = useMemo(() => {
    return outfitConfigs
      .filter((c) => (orderCategoryTab === "All" ? true : c.category === orderCategoryTab))
      .filter((c) =>
        (c.outfitStyle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [outfitConfigs, orderCategoryTab, searchQuery]);

  // Pagination Helper
  function getPaginated<T>(items: T[], page: number): { paginated: T[]; totalPages: number; totalCount: number } {
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const paginated = items.slice(start, start + PAGE_SIZE);
    return { paginated, totalPages, totalCount };
  }

  const { paginated: paginatedOrders, totalPages: orderPages } = getPaginated(filteredOrders, currentPage);
  const { paginated: paginatedMeasurements, totalPages: measurementPages } = getPaginated(filteredMeasurements, currentPage);
  const { paginated: paginatedFabrics, totalPages: fabricPages } = getPaginated(filteredFabrics, currentPage);
  const { paginated: paginatedClients, totalPages: clientPages } = getPaginated(filteredClients, currentPage);
  const { paginated: paginatedStyles, totalPages: stylePages } = getPaginated(filteredStyles, currentPage);

  // Pagination UI
  function renderPagination(totalPages: number, totalCount: number) {
    if (totalCount <= PAGE_SIZE) return null;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderTop: "1px solid #f2e8ed",
          backgroundColor: "#ffffff",
          fontSize: "13px",
          color: "#78716c",
        }}
      >
        <span>
          Showing <strong>{Math.min(PAGE_SIZE, totalCount - (currentPage - 1) * PAGE_SIZE)}</strong> of{" "}
          <strong>{totalCount}</strong> records
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #e7e5e4",
              background: currentPage === 1 ? "#fafaf9" : "#ffffff",
              color: currentPage === 1 ? "#d6d3d1" : "#1c1917",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ padding: "0 8px", fontWeight: "600", color: "#be185d" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #e7e5e4",
              background: currentPage >= totalPages ? "#fafaf9" : "#ffffff",
              color: currentPage >= totalPages ? "#d6d3d1" : "#1c1917",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (authChecking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdfafb",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="couture-loader-ring"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #be185d 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(190, 24, 93, 0.35)",
              animation: "pulseGlow 2s infinite ease-in-out",
            }}
          >
            <Scissors size={26} />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "#1c1917", letterSpacing: "0.5px" }}>
            JO DESIGNERS ATELIER
          </div>
          <div style={{ fontSize: "12px", color: "#be185d", fontWeight: "600", marginTop: "4px", letterSpacing: "0.2px" }}>
            Weaving Custom Tailoring & Bridal Couture...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdfafb",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 20px 45px rgba(190, 24, 93, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)",
            border: "1px solid #fce7f3",
            padding: "36px 32px",
          }}
        >
          {/* Brand Banner */}
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#fdf2f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#be185d",
              }}
            >
              <Sparkles size={24} />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1c1917", margin: "0 0 6px 0" }}>
              JO Designers
            </h1>
            <p style={{ fontSize: "13px", color: "#78716c", margin: 0 }}>
              {adminAuthMode === "signin"
                ? "Welcome back! Sign in to access bespoke tailoring & studio orders"
                : "Create an account to access custom designs & measurements"}
            </p>
          </div>

          {/* Tabs: Sign In / Sign Up */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#f5f5f4",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAdminAuthMode("signin");
                setAdminError("");
                setAdminSuccess("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: adminAuthMode === "signin" ? "#ffffff" : "transparent",
                color: adminAuthMode === "signin" ? "#be185d" : "#78716c",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: adminAuthMode === "signin" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminAuthMode("signup");
                setAdminError("");
                setAdminSuccess("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: adminAuthMode === "signup" ? "#ffffff" : "transparent",
                color: adminAuthMode === "signup" ? "#be185d" : "#78716c",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: adminAuthMode === "signup" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Alerts */}
          {adminError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                color: "#b91c1c",
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              <AlertCircle size={16} />
              <span>{adminError}</span>
            </div>
          )}

          {adminSuccess && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #dcfce7",
                color: "#15803d",
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              <CheckCircle2 size={16} />
              <span>{adminSuccess}</span>
            </div>
          )}

          {/* Tab 1: Sign In Form */}
          {adminAuthMode === "signin" ? (
            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Email Address or Username
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder="admin or user@jodesigners.com"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Users size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Lock size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: isAuthLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
                  opacity: isAuthLoading ? 0.7 : 1,
                }}
              >
                {isAuthLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          ) : adminAuthMode === "signup" ? (
            /* Tab 2: Sign Up Form */
            <form onSubmit={handleAdminSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={adminSignupName}
                    onChange={(e) => setAdminSignupName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Users size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={adminSignupEmail}
                    onChange={(e) => setAdminSignupEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Mail size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Create Password (min 6 characters)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminSignupPassword}
                    onChange={(e) => setAdminSignupPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Lock size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Lock size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: isAuthLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
                  opacity: isAuthLoading ? 0.7 : 1,
                }}
              >
                {isAuthLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          ) : (
            /* Tab 3: Confirm Code */
            <form onSubmit={handleConfirmCode} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#44403c", marginBottom: "6px" }}>
                  Verification Code
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder="Enter confirmation code"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 36px",
                      borderRadius: "10px",
                      border: "1px solid #e7e5e4",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      letterSpacing: "2px",
                    }}
                  />
                  <ShieldCheck size={16} color="#a8a29e" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
                <div style={{ fontSize: "12px", color: "#78716c", marginTop: "4px" }}>
                  Sent to: <strong>{unconfirmedEmail}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: isAuthLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(190, 24, 93, 0.25)",
                  opacity: isAuthLoading ? 0.7 : 1,
                }}
              >
                {isAuthLoading ? "Verifying..." : "Confirm & Complete"}
              </button>

              <button
                type="button"
                onClick={() => setAdminAuthMode("signin")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#be185d",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout-container" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fdfafb", color: "#1c1917" }}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${sidebarOpen ? "mobile-open" : ""}`}
        style={{
          width: sidebarOpen ? "275px" : "80px",
          transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "linear-gradient(180deg, #180e1d 0%, #120916 60%, #0d0611 100%)",
          borderRight: "1px solid rgba(190, 24, 93, 0.2)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 40,
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.18)",
        }}
      >
        <div
          style={{
            height: "72px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: "1px solid rgba(251, 207, 232, 0.08)",
            justifyContent: sidebarOpen ? "space-between" : "center",
            background: "radial-gradient(ellipse at top left, rgba(190, 24, 93, 0.2), transparent 70%)",
          }}
        >
          {sidebarOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #be185d 0%, #db2777 50%, #f472b6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 6px 18px rgba(190, 24, 93, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Scissors size={20} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#fdf2f8", letterSpacing: "0.02em" }}>
                  JO DESIGNERS
                </span>
                <span style={{ fontSize: "10.5px", fontWeight: "600", color: "#f472b6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Bespoke Haute Couture
                </span>
              </div>
            </div>
          ) : (
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
                boxShadow: "0 6px 18px rgba(190, 24, 93, 0.45)",
              }}
            >
              <Scissors size={20} />
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#fbcfe8",
              cursor: "pointer",
              padding: "7px",
              borderRadius: "8px",
              display: sidebarOpen ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Toggle sidebar"
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <div style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
          {sidebarOpen && (
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#9d8b9e",
                padding: "8px 12px 4px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={11} color="#f472b6" /> Atelier Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigateToTab(item.name);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: isActive ? "1px solid rgba(244, 114, 182, 0.4)" : "1px solid transparent",
                  cursor: "pointer",
                  fontSize: "13.5px",
                  fontWeight: isActive ? "700" : "500",
                  backgroundColor: isActive ? "rgba(190, 24, 93, 0.28)" : "transparent",
                  color: isActive ? "#ffffff" : "#d8cdd9",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  boxShadow: isActive ? "0 4px 14px rgba(190, 24, 93, 0.25)" : "none",
                  outline: "none",
                }}
              >
                <Icon size={18} style={{ color: isActive ? "#f472b6" : "#a899ab", flexShrink: 0 }} />
                {sidebarOpen && <span style={{ flex: 1, textAlign: "left" }}>{item.name}</span>}
                {sidebarOpen && item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: isActive ? "#be185d" : "rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#ffffff" : "#fbcfe8",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ marginTop: "14px", borderTop: "1px solid rgba(251, 207, 232, 0.08)", paddingTop: "14px" }}>
            <Link
              href="/showcase"
              target="_blank"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(190, 24, 93, 0.35)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                background: "linear-gradient(135deg, rgba(190, 24, 93, 0.16) 0%, rgba(219, 39, 119, 0.08) 100%)",
                color: "#fbcfe8",
                textDecoration: "none",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                transition: "all 0.2s ease",
              }}
            >
              <Globe size={17} color="#f472b6" style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>Client Website Showcase ↗</span>}
            </Link>
          </div>
        </div>

        {/* Footer Profile */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            style={{
              padding: "14px",
              borderTop: "1px solid rgba(251, 207, 232, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(10, 4, 13, 0.65)",
              backdropFilter: "blur(8px)",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(190, 24, 93, 0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(10, 4, 13, 0.65)")}
            title="View profile & account options"
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                flexShrink: 0,
              }}
            >
              {(currentUserProfile.name || "AD").slice(0, 2).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#fdf2f8",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUserProfile.name || "Studio Admin"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#10b981",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUserProfile.email || "Active Session"}
                </div>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfilePopup(!showProfilePopup);
              }}
              title="Account Options"
              style={{
                background: "transparent",
                border: "none",
                color: "#f43f5e",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Flyout Popup Attached Beside the Sidebar */}
          {showProfilePopup && (
            <div
              style={{
                position: "absolute",
                left: sidebarOpen ? "275px" : "80px",
                bottom: "10px",
                width: "300px",
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid #f2e8ed",
                padding: "18px",
                zIndex: 100,
                animation: "fadeIn 0.15s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      backgroundColor: "#fdf2f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#be185d",
                    }}
                  >
                    <Users size={16} />
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#1c1917" }}>
                    Account Profile
                  </span>
                </div>
                <button
                  onClick={() => setShowProfilePopup(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c", padding: "2px" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                <div style={{ padding: "8px 10px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#78716c", letterSpacing: "0.5px" }}>
                    Name
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#1c1917" }}>
                    {currentUserProfile.name || "Studio Administrator"}
                  </div>
                </div>

                <div style={{ padding: "8px 10px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#78716c", letterSpacing: "0.5px" }}>
                    Email
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#1c1917", wordBreak: "break-all" }}>
                    {currentUserProfile.email || "admin@jodesigners.com"}
                  </div>
                </div>

                <div style={{ padding: "8px 10px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#78716c", letterSpacing: "0.5px" }}>
                    Role
                  </div>
                  <span style={{ display: "inline-block", fontSize: "11px", fontWeight: "700", color: "#be185d", backgroundColor: "#fdf2f8", padding: "2px 8px", borderRadius: "4px", marginTop: "2px" }}>
                    {currentUserProfile.role || "Administrator"}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  setShowProfilePopup(false);
                  handleLogout();
                }}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  color: "#e11d48",
                  border: "1px solid #fecdd3",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e11d48";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#e11d48";
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Wrapper */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <header
          className="admin-top-header"
          style={{
            height: "72px",
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(190, 24, 93, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 4px 20px rgba(190, 24, 93, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "#fdf2f8",
                  border: "1px solid #fbcfe8",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#be185d",
                  transition: "all 0.15s ease",
                }}
              >
                <Menu size={17} />
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#fdf2f8",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  border: "1px solid #fce7f3",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#831843",
                }}
              >
                <Scissors size={13} color="#be185d" /> JO Atelier Studio
              </div>
              <span style={{ color: "#d6d3d1" }}>/</span>
              <span style={{ color: "#be185d", fontWeight: "700", fontSize: "14.5px" }}>{activeNav}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
            {/* Global Search */}
            <div
              className="admin-search-bar"
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fcf8fa",
                borderRadius: "12px",
                padding: "8px 14px",
                gap: "10px",
                width: "290px",
                border: "1.5px solid #f2e8ed",
                transition: "border-color 0.2s ease",
              }}
            >
              <Search size={16} color="#be185d" />
              <input
                type="text"
                placeholder="Search orders, clients, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#1c1917",
                  width: "100%",
                }}
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: "relative",
                background: "#fdf2f8",
                border: "1px solid #fbcfe8",
                borderRadius: "12px",
                padding: "9px 11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#be185d",
                transition: "all 0.15s ease",
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#db2777",
                    borderRadius: "50%",
                  }}
                />
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  right: "140px",
                  top: "48px",
                  width: "320px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #f2e8ed",
                  padding: "16px",
                  zIndex: 50,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#1c1917" }}>Alerts & Trials</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "#fdf2f8",
                        fontSize: "12px",
                        color: "#831843",
                        border: "1px solid #fbcfe8",
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual Action Button */}
            {activeNav === "Admin Catalog & Styles" ? (
              isAdminLoggedIn ? (
                <button
                  onClick={() => setShowAdminStyleModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} /> Add Outfit Style
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Link
                    href="/auth"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#be185d",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    <Lock size={16} /> Sign In / Sign Up
                  </Link>
                </div>
              )
            ) : activeNav === "Measurement Book" ? (
              <button
                onClick={() => setShowMeasurementModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Record Measurement
              </button>
            ) : activeNav === "Fabric & Embellishments" ? (
              <button
                onClick={() => setShowFabricModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Add Fabric Stock
              </button>
            ) : activeNav === "Client Directory" ? (
              <button
                onClick={() => setShowClientModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Register Client
              </button>
            ) : (
              <button
                onClick={() => setShowOrderModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#be185d",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Book Custom Order
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="responsive-main" style={{ flex: 1, padding: "32px 36px", maxWidth: "1320px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {/* ======================= SINGLE CONSOLIDATED VIEW: CUSTOM ORDERS (ALL, WOMEN, KIDS) ======================= */}
          {activeNav === "Custom Orders" && (
            <div>
              {/* Header section with metrics */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917" }}>
                    Costume & Tailoring Orders
                  </h1>
                  <p style={{ fontSize: "13.5px", color: "#78716c", marginTop: "4px" }}>
                    Consolidated report for Women's Couture, Kids & Teens Wear, and Custom Outfits.
                  </p>
                </div>

                <button
                  onClick={() => setShowOrderModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#be185d",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} /> Book New Order
                </button>
              </div>

              {/* Quick Stat Tiles */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f2e8ed" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#78716c" }}>All Orders</span>
                    <ShoppingBag size={18} color="#be185d" />
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917", marginTop: "8px" }}>
                    {orders.length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#be185d", marginTop: "2px" }}>Active Atelier Orders</div>
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f2e8ed" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#78716c" }}>Women's Couture</span>
                    <Heart size={18} color="#db2777" />
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917", marginTop: "8px" }}>
                    {womenOrdersCount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#db2777", marginTop: "2px" }}>Bridal, Blouses & Lehengas</div>
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f2e8ed" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#78716c" }}>Kids & Teens</span>
                    <Baby size={18} color="#0284c7" />
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917", marginTop: "8px" }}>
                    {kidsOrdersCount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#0284c7", marginTop: "2px" }}>Frocks & Fancy Costumes</div>
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f2e8ed" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#78716c" }}>In Stitching</span>
                    <Scissors size={18} color="#059669" />
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917", marginTop: "8px" }}>
                    {orders.filter((o) => o.status === "In Stitching").length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>Active Sewing Queue</div>
                </div>
              </div>

              {/* Segmented Category Filter Tabs & Status Dropdown */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {/* Clean Segment Tabs: All, Women, Kids */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#78716c" }}>View Category:</span>
                  <button
                    onClick={() => setOrderCategoryTab("All")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      border: orderCategoryTab === "All" ? "1px solid #be185d" : "1px solid #e7e5e4",
                      backgroundColor: orderCategoryTab === "All" ? "#fdf2f8" : "#ffffff",
                      color: orderCategoryTab === "All" ? "#be185d" : "#78716c",
                      fontSize: "13px",
                      fontWeight: orderCategoryTab === "All" ? "600" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>All Outfits</span>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>({orders.length})</span>
                  </button>

                  <button
                    onClick={() => setOrderCategoryTab("Women")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      border: orderCategoryTab === "Women" ? "1px solid #be185d" : "1px solid #e7e5e4",
                      backgroundColor: orderCategoryTab === "Women" ? "#fdf2f8" : "#ffffff",
                      color: orderCategoryTab === "Women" ? "#be185d" : "#78716c",
                      fontSize: "13px",
                      fontWeight: orderCategoryTab === "Women" ? "600" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Heart size={14} color={orderCategoryTab === "Women" ? "#be185d" : "#78716c"} />
                    <span>Women's Couture</span>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>({womenOrdersCount})</span>
                  </button>

                  <button
                    onClick={() => setOrderCategoryTab("Kids")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      border: orderCategoryTab === "Kids" ? "1px solid #be185d" : "1px solid #e7e5e4",
                      backgroundColor: orderCategoryTab === "Kids" ? "#fdf2f8" : "#ffffff",
                      color: orderCategoryTab === "Kids" ? "#be185d" : "#78716c",
                      fontSize: "13px",
                      fontWeight: orderCategoryTab === "Kids" ? "600" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Baby size={14} color={orderCategoryTab === "Kids" ? "#be185d" : "#78716c"} />
                    <span>Kids & Teens Wear</span>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>({kidsOrdersCount})</span>
                  </button>

                  {/* Any custom categories added via Admin */}
                  {availableCategories
                    .filter((c) => c !== "Women" && c !== "Kids")
                    .map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setOrderCategoryTab(cat)}
                        style={{
                          padding: "6px 16px",
                          borderRadius: "20px",
                          border: orderCategoryTab === cat ? "1px solid #be185d" : "1px solid #e7e5e4",
                          backgroundColor: orderCategoryTab === cat ? "#fdf2f8" : "#ffffff",
                          color: orderCategoryTab === cat ? "#be185d" : "#78716c",
                          fontSize: "13px",
                          fontWeight: orderCategoryTab === cat ? "600" : "500",
                          cursor: "pointer",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                </div>

                {/* Stage Status filter */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#78716c" }}>Stage:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e7e5e4",
                      fontSize: "13px",
                      backgroundColor: "#fafaf9",
                      outline: "none",
                    }}
                  >
                    <option value="All">All Stages</option>
                    <option value="Measurement Pending">Measurement Pending</option>
                    <option value="Pattern Making">Pattern Making</option>
                    <option value="In Stitching">In Stitching</option>
                    <option value="Trial / Fitting">Trial / Fitting</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Table Report */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  overflow: "hidden",
                }}
              >
                <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#faf5f7", borderBottom: "1px solid #f2e8ed", color: "#78716c" }}>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Client & Contact</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Category</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Outfit Style</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Fabric Specs</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Estimated Price</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Stitching Stage</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={`order-skel-${idx}`} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "130px", height: "14px", borderRadius: "4px", marginBottom: "6px" }} />
                              <div className="couture-shimmer" style={{ width: "85px", height: "10px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "18px", borderRadius: "10px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "110px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "90px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "70px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "80px", height: "20px", borderRadius: "12px" }} />
                            </td>
                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div className="couture-shimmer" style={{ width: "70px", height: "26px", borderRadius: "6px", marginLeft: "auto" }} />
                            </td>
                          </tr>
                        ))
                      ) : paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#a8a29e" }}>
                            No orders found for the selected category/filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => (
                          <tr
                            key={order.id}
                            style={{ borderBottom: "1px solid #faf5f7", transition: "background 0.15s ease" }}
                          >
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: "600", color: "#1c1917" }}>{order.customerName}</div>
                              <div style={{ fontSize: "12px", color: "#78716c", marginTop: "2px" }}>{order.phone}</div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: order.category === "Women" ? "#fce7f3" : "#e0f2fe",
                                  color: order.category === "Women" ? "#9d174d" : "#0369a1",
                                }}
                              >
                                {order.category}
                              </span>
                            </td>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#be185d" }}>
                              {order.outfitType}
                            </td>
                            <td style={{ padding: "14px 18px", color: "#57534e" }}>{order.fabric}</td>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#059669" }}>
                              {order.amount || "₹ 4,000"}
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #e7e5e4",
                                  backgroundColor:
                                    order.status === "Delivered"
                                      ? "#ecfdf5"
                                      : order.status === "Trial / Fitting"
                                      ? "#fdf2f8"
                                      : "#fafaf9",
                                  color:
                                    order.status === "Delivered"
                                      ? "#047857"
                                      : order.status === "Trial / Fitting"
                                      ? "#be185d"
                                      : "#44403c",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="Measurement Pending">Measurement Pending</option>
                                <option value="Pattern Making">Pattern Making</option>
                                <option value="In Stitching">In Stitching</option>
                                <option value="Trial / Fitting">Trial / Fitting</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                <button
                                  onClick={() => setViewingItem(order)}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #e7e5e4",
                                    padding: "5px 8px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  <Eye size={13} /> View
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #fee2e2",
                                    color: "#ef4444",
                                    padding: "5px 8px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(orderPages, filteredOrders.length)}
              </div>
            </div>
          )}

          {/* ======================= VIEW 2: MEASUREMENTS TABLE REPORT ======================= */}
          {activeNav === "Measurement Book" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917" }}>Bespoke Measurement Book Report</h1>
                  <p style={{ fontSize: "13.5px", color: "#78716c", marginTop: "4px" }}>
                    Tabular report of anatomical sizing records synced with AWS DynamoDB (Measurement).
                  </p>
                </div>

                <button
                  onClick={() => setShowMeasurementModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#be185d",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} /> Record Measurement
                </button>
              </div>

              {/* Filter */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                <Filter size={16} color="#78716c" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#78716c" }}>Filter Pattern:</span>
                <button
                  onClick={() => setOrderCategoryTab("All")}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "16px",
                    border: orderCategoryTab === "All" ? "1px solid #be185d" : "1px solid #e7e5e4",
                    backgroundColor: orderCategoryTab === "All" ? "#fdf2f8" : "#ffffff",
                    color: orderCategoryTab === "All" ? "#be185d" : "#78716c",
                    fontSize: "12.5px",
                    fontWeight: orderCategoryTab === "All" ? "600" : "500",
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                {availableCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setOrderCategoryTab(c)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "16px",
                      border: orderCategoryTab === c ? "1px solid #be185d" : "1px solid #e7e5e4",
                      backgroundColor: orderCategoryTab === c ? "#fdf2f8" : "#ffffff",
                      color: orderCategoryTab === c ? "#be185d" : "#78716c",
                      fontSize: "12.5px",
                      fontWeight: orderCategoryTab === c ? "600" : "500",
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  overflow: "hidden",
                }}
              >
                <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#faf5f7", borderBottom: "1px solid #f2e8ed", color: "#78716c" }}>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Client Name</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Category</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Bust / Chest</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Waist</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Hip</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Length</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`meas-skel-${idx}`} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "120px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "18px", borderRadius: "10px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "50px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "50px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "50px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "50px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "26px", borderRadius: "6px", marginLeft: "auto" }} />
                            </td>
                          </tr>
                        ))
                      ) : paginatedMeasurements.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#a8a29e" }}>
                            No measurements recorded. Click "Record Measurement" to create one.
                          </td>
                        </tr>
                      ) : (
                        paginatedMeasurements.map((m) => (
                          <tr key={m.id} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#1c1917" }}>{m.clientName}</td>
                            <td style={{ padding: "14px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: "#fce7f3",
                                  color: "#9d174d",
                                }}
                              >
                                {m.category}
                              </span>
                            </td>
                            <td style={{ padding: "14px 18px" }}>{m.bustChest}"</td>
                            <td style={{ padding: "14px 18px" }}>{m.waist}"</td>
                            <td style={{ padding: "14px 18px" }}>{m.hip}"</td>
                            <td style={{ padding: "14px 18px" }}>{m.length}"</td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteMeasurement(m.id)}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #fee2e2",
                                  color: "#ef4444",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(measurementPages, filteredMeasurements.length)}
              </div>
            </div>
          )}

          {/* ======================= VIEW 3: FABRICS TABLE REPORT ======================= */}
          {activeNav === "Fabric & Embellishments" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917" }}>Fabric & Stock Inventory Report</h1>
                  <p style={{ fontSize: "13.5px", color: "#78716c", marginTop: "4px" }}>
                    Tabular report of raw fabrics and embellishments synced with AWS DynamoDB (FabricStock).
                  </p>
                </div>

                <button
                  onClick={() => setShowFabricModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#be185d",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} /> Add Fabric Stock
                </button>
              </div>

              {/* Table */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  overflow: "hidden",
                }}
              >
                <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#faf5f7", borderBottom: "1px solid #f2e8ed", color: "#78716c" }}>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Material Name</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Fabric Type</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Color Tone</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Stock Available</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`fabric-skel-${idx}`} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "130px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "70px", height: "18px", borderRadius: "10px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "90px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "60px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "26px", borderRadius: "6px", marginLeft: "auto" }} />
                            </td>
                          </tr>
                        ))
                      ) : paginatedFabrics.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#a8a29e" }}>
                            No fabrics in inventory. Click "Add Fabric Stock" to add raw material.
                          </td>
                        </tr>
                      ) : (
                        paginatedFabrics.map((f) => (
                          <tr key={f.id} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#1c1917" }}>{f.materialName}</td>
                            <td style={{ padding: "14px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: "#f5f5f4",
                                  color: "#44403c",
                                }}
                              >
                                {f.type}
                              </span>
                            </td>
                            <td style={{ padding: "14px 18px", color: "#57534e" }}>{f.colorShade}</td>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#059669" }}>
                              {f.metersAvailable} Meters
                            </td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteFabric(f.id)}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #fee2e2",
                                  color: "#ef4444",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(fabricPages, filteredFabrics.length)}
              </div>
            </div>
          )}

          {/* ======================= VIEW 4: CLIENT DIRECTORY TABLE REPORT ======================= */}
          {activeNav === "Client Directory" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917" }}>Client Profiles & History Report</h1>
                  <p style={{ fontSize: "13.5px", color: "#78716c", marginTop: "4px" }}>
                    Tabular report of all registered clients synced with AWS DynamoDB (ClientProfile).
                  </p>
                </div>

                <button
                  onClick={() => setShowClientModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#be185d",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} /> Register Client
                </button>
              </div>

              {/* Table */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  overflow: "hidden",
                }}
              >
                <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#faf5f7", borderBottom: "1px solid #f2e8ed", color: "#78716c" }}>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Full Name</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Phone Number</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Email / Location</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Preferred Styling</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`client-skel-${idx}`} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "120px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "95px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "140px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "80px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "26px", borderRadius: "6px", marginLeft: "auto" }} />
                            </td>
                          </tr>
                        ))
                      ) : paginatedClients.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#a8a29e" }}>
                            No client profiles found. Click "Register Client" to add.
                          </td>
                        </tr>
                      ) : (
                        paginatedClients.map((c) => (
                          <tr key={c.id} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#1c1917" }}>
                              {c.fullName || c.customerName}
                            </td>
                            <td style={{ padding: "14px 18px", color: "#57534e" }}>{c.phone}</td>
                            <td style={{ padding: "14px 18px", color: "#78716c", fontSize: "12.5px" }}>
                              {c.email || "client@boutique.com"} · {c.address || "Chennai"}
                            </td>
                            <td style={{ padding: "14px 18px", fontWeight: "500", color: "#be185d" }}>
                              {c.preferredStyle || c.outfitType}
                            </td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteClient(c.id)}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #fee2e2",
                                  color: "#ef4444",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(clientPages, filteredClients.length)}
              </div>
            </div>
          )}

          {/* ======================= VIEW 5: ADMIN STYLES & CATEGORIES TABLE REPORT ======================= */}
          {activeNav === "Admin Catalog & Styles" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917" }}>
                    Categories & Outfit Styles Report
                  </h1>
                  <p style={{ fontSize: "13.5px", color: "#78716c", marginTop: "4px" }}>
                    Tabular report of dynamically configured outfit styles synced with AWS DynamoDB (OutfitConfig).
                  </p>
                </div>

                {isAdminLoggedIn ? (
                  <button
                    onClick={() => setShowAdminStyleModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#059669",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={16} /> Add Outfit Style
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#be185d",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    <Lock size={16} /> Admin Sign In / Sign Up
                  </Link>
                )}
              </div>

              {/* Filter */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Filter size={16} color="#78716c" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#78716c" }}>Filter Category:</span>
                <button
                  onClick={() => setOrderCategoryTab("All")}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "16px",
                    border: orderCategoryTab === "All" ? "1px solid #be185d" : "1px solid #e7e5e4",
                    backgroundColor: orderCategoryTab === "All" ? "#fdf2f8" : "#ffffff",
                    color: orderCategoryTab === "All" ? "#be185d" : "#78716c",
                    fontSize: "12.5px",
                    fontWeight: orderCategoryTab === "All" ? "600" : "500",
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                {availableCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setOrderCategoryTab(c)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "16px",
                      border: orderCategoryTab === c ? "1px solid #be185d" : "1px solid #e7e5e4",
                      backgroundColor: orderCategoryTab === c ? "#fdf2f8" : "#ffffff",
                      color: orderCategoryTab === c ? "#be185d" : "#78716c",
                      fontSize: "12.5px",
                      fontWeight: orderCategoryTab === c ? "600" : "500",
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  overflow: "hidden",
                }}
              >
                <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#faf5f7", borderBottom: "1px solid #f2e8ed", color: "#78716c" }}>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Category</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Outfit Style Name</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`style-skel-${idx}`} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "18px", borderRadius: "10px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "160px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "26px", borderRadius: "6px", marginLeft: "auto" }} />
                            </td>
                          </tr>
                        ))
                      ) : paginatedStyles.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#a8a29e" }}>
                            No styles found.
                          </td>
                        </tr>
                      ) : (
                        paginatedStyles.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "14px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: "#fce7f3",
                                  color: "#9d174d",
                                }}
                              >
                                {s.category}
                              </span>
                            </td>
                            <td style={{ padding: "14px 18px", fontWeight: "600", color: "#1c1917" }}>{s.outfitStyle}</td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              {isAdminLoggedIn ? (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <button
                                    onClick={() => handleStartEditOutfitConfig(s)}
                                    title="Edit Style"
                                    style={{
                                      background: "#fdf2f8",
                                      border: "1px solid #fbcfe8",
                                      color: "#be185d",
                                      padding: "5px 8px",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    <Edit2 size={13} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOutfitConfig(s.id)}
                                    title="Delete Style"
                                    style={{
                                      background: "#ffffff",
                                      border: "1px solid #fee2e2",
                                      color: "#ef4444",
                                      padding: "5px 8px",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "12px", color: "#a8a29e" }}>Admin Login Required</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(stylePages, filteredStyles.length)}
              </div>
            </div>
          )}

          {/* ======================= VIEW 6: WORK SHOWCASE & UPLOADS (S3 INTEGRATION) ======================= */}
          {activeNav === "Work Showcase & Uploads" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c1917" }}>
                    Work Showcase & S3 Bucket Uploads
                  </h1>
                  <p style={{ fontSize: "13.5px", color: "#78716c", marginTop: "4px" }}>
                    Manage customer-facing portfolio designs synced with S3 storage and DynamoDB (ShowcaseWork).
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    href="/showcase"
                    target="_blank"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#fdf2f8",
                      color: "#9d174d",
                      border: "1px solid #fbcfe8",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    <Globe size={16} /> Open Public Showcase ↗
                  </Link>

                  {isAdminLoggedIn ? (
                    <button
                      onClick={() => {
                        setEditingShowcaseWork(null);
                        setWorkTitle("");
                        setWorkCategory("Women");
                        setWorkOutfitType("");
                        setWorkDescription("");
                        setWorkFabric("");
                        setWorkImageUrl("");
                        setShowWorkUploadModal(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "#be185d",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      <Upload size={16} /> Upload New Work
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#a8a29e", alignSelf: "center" }}>
                      Admin Login Required to Upload
                    </span>
                  )}
                </div>
              </div>

              {/* Table Report with Image Preview, S3 URL, Replace, and Delete */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #f2e8ed",
                  overflow: "hidden",
                }}
              >
                <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#faf5f7", borderBottom: "1px solid #f2e8ed", color: "#78716c" }}>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Creation Preview</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Design Title</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Category</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600" }}>Fabric Details</th>
                        <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`showcase-skel-${idx}`} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "50px", height: "50px", borderRadius: "8px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "150px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "65px", height: "18px", borderRadius: "10px" }} />
                            </td>
                            <td style={{ padding: "16px 18px" }}>
                              <div className="couture-shimmer" style={{ width: "110px", height: "14px", borderRadius: "4px" }} />
                            </td>
                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                              <div className="couture-shimmer" style={{ width: "70px", height: "26px", borderRadius: "6px", marginLeft: "auto" }} />
                            </td>
                          </tr>
                        ))
                      ) : showcaseWorks.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#a8a29e" }}>
                            No showcase works uploaded yet. Click "Upload New Work" to upload image to S3 bucket.
                          </td>
                        </tr>
                      ) : (
                        showcaseWorks.map((work) => (
                          <tr key={work.id} style={{ borderBottom: "1px solid #faf5f7" }}>
                            <td style={{ padding: "12px 18px" }}>
                              <div
                                style={{
                                  width: "56px",
                                  height: "56px",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  border: "1px solid #f2e8ed",
                                  backgroundColor: "#fdf2f8",
                                }}
                              >
                                <img
                                  src={work.imageUrl}
                                  alt={work.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: "600", color: "#1c1917" }}>{work.title}</div>
                              <div style={{ fontSize: "12px", color: "#78716c", marginTop: "2px" }}>
                                {work.outfitType || "Bespoke Couture"}
                              </div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: work.category === "Women" ? "#fce7f3" : "#e0f2fe",
                                  color: work.category === "Women" ? "#9d174d" : "#0369a1",
                                }}
                              >
                                {work.category}
                              </span>
                            </td>
                            <td style={{ padding: "14px 18px", color: "#57534e", fontSize: "12.5px" }}>
                              {work.fabricDetails || "Silk / Handcrafted"}
                            </td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              {isAdminLoggedIn ? (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <button
                                    onClick={() => handleStartEditShowcaseWork(work)}
                                    title="Replace or Edit Work"
                                    style={{
                                      background: "#fdf2f8",
                                      border: "1px solid #fbcfe8",
                                      color: "#be185d",
                                      padding: "5px 8px",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    <Edit2 size={13} /> Replace / Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShowcaseWork(work)}
                                    title="Delete from S3 and Showcase"
                                    style={{
                                      background: "#ffffff",
                                      border: "1px solid #fee2e2",
                                      color: "#ef4444",
                                      padding: "5px 8px",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "12px", color: "#a8a29e" }}>Admin Login Required</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================= MODAL 1: ORDER CREATION FORM ======================= */}
          {showOrderModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  maxWidth: "680px",
                  padding: "28px",
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "#fdf2f8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#be185d",
                      }}
                    >
                      <Plus size={18} />
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      Book Custom Tailoring Order
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                        Client Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Radhika Sundaram"
                        value={orderCustomer}
                        onChange={(e) => setOrderCustomer(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#fafaf9",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98401 54321"
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#fafaf9",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                        Category (Women, Kids or Custom)
                      </label>
                      <select
                        value={orderCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrderCategory(val);
                          if (val === "None") {
                            setOrderOutfitType("None");
                            setOrderAmount("");
                          } else {
                            const matched = outfitConfigs.find((c) => c.category === val);
                            if (matched) {
                              setOrderOutfitType(matched.outfitStyle);
                              setOrderAmount(matched.basePrice || "₹ 4,000");
                            }
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#fafaf9",
                          outline: "none",
                        }}
                      >
                        <option value="None">None</option>
                        {availableCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                        Outfit Style (Dynamic from Admin)
                      </label>
                      <select
                        value={orderOutfitType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrderOutfitType(val);
                          const matched = outfitConfigs.find((c) => c.outfitStyle === val);
                          if (matched?.basePrice) setOrderAmount(matched.basePrice);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#fafaf9",
                          outline: "none",
                        }}
                      >
                        <option value="None">None</option>
                        {availableStylesForCategory.map((style) => (
                          <option key={style.id || style.outfitStyle} value={style.outfitStyle}>
                            {style.outfitStyle} ({style.basePrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                        Fabric Material
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pure Chanderi Silk with Golden Zari"
                        value={orderFabric}
                        onChange={(e) => setOrderFabric(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#fafaf9",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                        Estimated Pricing
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹ 5,500"
                        value={orderAmount}
                        onChange={(e) => setOrderAmount(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#fafaf9",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                      Initial Stage
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: "14px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#fafaf9",
                        outline: "none",
                      }}
                    >
                      <option value="Measurement Pending">Measurement Pending</option>
                      <option value="Pattern Making">Pattern Making</option>
                      <option value="In Stitching">In Stitching</option>
                      <option value="Trial / Fitting">Trial / Fitting</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(false)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#ffffff",
                        color: "#78716c",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#be185d",
                        color: "#ffffff",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Save Order to DynamoDB
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================= MODAL 2: MEASUREMENT FORM ======================= */}
          {showMeasurementModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  maxWidth: "600px",
                  padding: "28px",
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Ruler size={20} color="#be185d" />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      Record Body Measurements (in inches)
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowMeasurementModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveMeasurement} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Client Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shalini Menon"
                        value={measureClient}
                        onChange={(e) => setMeasureClient(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Pattern Category
                      </label>
                      <select
                        value={measureCategory}
                        onChange={(e) => setMeasureCategory(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      >
                        {availableCategories.map((c) => (
                          <option key={c} value={c}>
                            {c} Pattern
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Bust / Chest (in)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 36"
                        value={bustChest}
                        onChange={(e) => setBustChest(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Waist (in)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 30"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Hips (in)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 40"
                        value={hip}
                        onChange={(e) => setHip(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Full Length (in)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 44"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setShowMeasurementModal(false)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#ffffff",
                        color: "#78716c",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#be185d",
                        color: "#ffffff",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Save Measurements
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================= MODAL 3: FABRIC STOCK FORM ======================= */}
          {showFabricModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  maxWidth: "500px",
                  padding: "28px",
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Palette size={20} color="#be185d" />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      Add Fabric / Embellishment Stock
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowFabricModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddFabric} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Material Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kanchipuram Brocade Silk"
                      value={fabricMaterial}
                      onChange={(e) => setFabricMaterial(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Color Shade
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Rani Pink / Gold"
                      value={fabricColor}
                      onChange={(e) => setFabricColor(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Meters in Stock
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 25"
                        value={fabricMeters}
                        onChange={(e) => setFabricMeters(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Fabric Type
                      </label>
                      <select
                        value={fabricType}
                        onChange={(e) => setFabricType(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      >
                        <option value="Silk">Silk</option>
                        <option value="Georgette">Georgette</option>
                        <option value="Velvet">Velvet</option>
                        <option value="Lace">Lace</option>
                        <option value="Zari">Zari Handwork</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setShowFabricModal(false)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#ffffff",
                        color: "#78716c",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#be185d",
                        color: "#ffffff",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Save to Inventory
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================= MODAL 4: CLIENT REGISTRATION FORM ======================= */}
          {showClientModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Users size={20} color="#be185d" />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      Register Client Profile
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowClientModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateClient} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shalini Menon"
                      value={clientFullName}
                      onChange={(e) => setClientFullName(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98401 99887"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. shalini@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Preferred Styling
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bridal Lehengas & Silk Sarees"
                      value={clientStyle}
                      onChange={(e) => setClientStyle(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setShowClientModal(false)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#ffffff",
                        color: "#78716c",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#be185d",
                        color: "#ffffff",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================= MODAL 5: ADMIN ADD OUTFIT STYLE FORM ======================= */}
          {showAdminStyleModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FolderPlus size={20} color="#059669" />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      {editingOutfitConfig ? "Edit Category & Outfit Style" : "Add Category & Outfit Style"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAdminStyleModal(false);
                      setEditingOutfitConfig(null);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAdminSaveOutfitConfig} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                      Category Mode
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setAdminCategoryMode("existing")}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: adminCategoryMode === "existing" ? "1px solid #be185d" : "1px solid #e7e5e4",
                          backgroundColor: adminCategoryMode === "existing" ? "#fdf2f8" : "#ffffff",
                          color: adminCategoryMode === "existing" ? "#be185d" : "#78716c",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Existing Category
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminCategoryMode("new")}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: adminCategoryMode === "new" ? "1px solid #be185d" : "1px solid #e7e5e4",
                          backgroundColor: adminCategoryMode === "new" ? "#fdf2f8" : "#ffffff",
                          color: adminCategoryMode === "new" ? "#be185d" : "#78716c",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        + Create New Category
                      </button>
                    </div>
                  </div>

                  {adminCategoryMode === "existing" ? (
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Select Category
                      </label>
                      <select
                        value={adminExistingCategory}
                        onChange={(e) => setAdminExistingCategory(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      >
                        {availableCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        New Category Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Teens Wear, Maternity, Bridal"
                        value={adminNewCategory}
                        onChange={(e) => setAdminNewCategory(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Outfit Style Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aari Work Embroidered Blouse"
                      value={adminNewStyle}
                      onChange={(e) => setAdminNewStyle(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminStyleModal(false);
                        setEditingOutfitConfig(null);
                      }}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#ffffff",
                        color: "#78716c",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#059669",
                        color: "#ffffff",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {editingOutfitConfig ? "Update Outfit Style" : "Save Outfit Style"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================= MODAL 6: ADMIN AUTH MODAL (SIGN IN / SIGN UP) ======================= */}
          {showLoginModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  maxWidth: "440px",
                  padding: "28px",
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Lock size={20} color="#be185d" />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      {adminAuthMode === "signin" ? "Admin Sign In" : "Admin Sign Up"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      setAdminError("");
                      setAdminSuccess("");
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Tabs for Sign In vs Sign Up */}
                <div style={{ display: "flex", backgroundColor: "#f5f5f4", borderRadius: "8px", padding: "4px", marginBottom: "18px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAuthMode("signin");
                      setAdminError("");
                      setAdminSuccess("");
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: adminAuthMode === "signin" ? "#ffffff" : "transparent",
                      color: adminAuthMode === "signin" ? "#be185d" : "#78716c",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: adminAuthMode === "signin" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAuthMode("signup");
                      setAdminError("");
                      setAdminSuccess("");
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: adminAuthMode === "signup" ? "#ffffff" : "transparent",
                      color: adminAuthMode === "signup" ? "#be185d" : "#78716c",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: adminAuthMode === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    Sign Up
                  </button>
                </div>

                {adminError && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "#fee2e2",
                      color: "#b91c1c",
                      fontSize: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    {adminError}
                  </div>
                )}

                {adminSuccess && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "#dcfce7",
                      color: "#15803d",
                      fontSize: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    {adminSuccess}
                  </div>
                )}

                {adminAuthMode === "signin" ? (
                  <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Admin Username or Email
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="admin or admin@jodesigners.com"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginModal(false);
                          setAdminError("");
                          setAdminSuccess("");
                        }}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#ffffff",
                          color: "#78716c",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#be185d",
                          color: "#ffffff",
                          padding: "10px 22px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Sign In
                      </button>
                    </div>
                    <div style={{ fontSize: "11px", color: "#a8a29e", textAlign: "center", marginTop: "6px" }}>
                      Default Admin: <strong>admin</strong> / <strong>designer@123</strong>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAdminSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Full Name / Designer Handle
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Master Designer"
                        value={adminSignupName}
                        onChange={(e) => setAdminSignupName(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Admin Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="admin@jodesigners.com"
                        value={adminSignupEmail}
                        onChange={(e) => setAdminSignupEmail(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Password (min 6 characters)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={adminSignupPassword}
                        onChange={(e) => setAdminSignupPassword(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginModal(false);
                          setAdminError("");
                          setAdminSuccess("");
                        }}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          border: "1px solid #e7e5e4",
                          backgroundColor: "#ffffff",
                          color: "#78716c",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#be185d",
                          color: "#ffffff",
                          padding: "10px 22px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Register Admin
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ======================= MODAL 7: VIEW DETAILS POPUP ======================= */}
          {viewingItem && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <button
                  onClick={() => setViewingItem(null)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#78716c",
                  }}
                >
                  <X size={20} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: "#fdf2f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#be185d",
                    }}
                  >
                    <Shirt size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      {viewingItem.customerName}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#78716c" }}>
                      {viewingItem.category} Costume Order
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#44403c" }}>
                  <div style={{ padding: "10px 14px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                    <span style={{ color: "#78716c" }}>Outfit Style: </span>
                    <strong>{viewingItem.outfitType}</strong>
                  </div>
                  <div style={{ padding: "10px 14px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                    <span style={{ color: "#78716c" }}>Fabric: </span>
                    <strong>{viewingItem.fabric}</strong>
                  </div>
                  <div style={{ padding: "10px 14px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                    <span style={{ color: "#78716c" }}>Phone: </span>
                    <strong>{viewingItem.phone}</strong>
                  </div>
                  <div style={{ padding: "10px 14px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                    <span style={{ color: "#78716c" }}>Status: </span>
                    <strong style={{ color: "#be185d" }}>{viewingItem.status}</strong>
                  </div>
                </div>

                <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    onClick={() => handleDeleteOrder(viewingItem.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #fee2e2",
                      color: "#ef4444",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Delete Order
                  </button>
                  <button
                    onClick={() => setViewingItem(null)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      backgroundColor: "#be185d",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================= MODAL 8: WORK UPLOAD & S3 REPLACE MODAL ======================= */}
          {showWorkUploadModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                  maxWidth: "540px",
                  padding: "28px",
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Upload size={20} color="#be185d" />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917" }}>
                      {editingShowcaseWork ? "Replace / Edit Showcase Work" : "Upload Design Work to S3"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowWorkUploadModal(false);
                      setEditingShowcaseWork(null);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveShowcaseWork} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* S3 Image Upload Area */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "6px" }}>
                      Design Photo (Stores in S3 Bucket) *
                    </label>
                    <div
                      style={{
                        border: "2px dashed #f2e8ed",
                        borderRadius: "12px",
                        padding: "16px",
                        textAlign: "center",
                        backgroundColor: "#fdfafb",
                        position: "relative",
                      }}
                    >
                      {workImageUrl ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                          <img
                            src={workImageUrl}
                            alt="Preview"
                            style={{ width: "140px", height: "140px", objectFit: "cover", borderRadius: "10px", border: "1px solid #f2e8ed" }}
                          />
                          <label
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#be185d",
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                          >
                            Click to replace image file in S3
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUploadToS3}
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>
                      ) : (
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", padding: "14px" }}>
                          <ImageIcon size={32} color="#be185d" />
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1c1917" }}>
                            {uploadingS3 ? "Uploading to S3..." : "Click or browse photo to upload"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#78716c" }}>PNG, JPG or WEBP (Max 10MB)</span>
                          <input
                            type="file"
                            accept="image/*"
                            required={!workImageUrl}
                            onChange={handleFileUploadToS3}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Creation / Work Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Traditional Zardosi Silk Bridal Lehenga"
                      value={workTitle}
                      onChange={(e) => setWorkTitle(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Category *
                      </label>
                      <select
                        value={workCategory}
                        onChange={(e) => setWorkCategory(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      >
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                        Outfit Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bridal Couture, Aari Blouse, Frock"
                        value={workOutfitType}
                        onChange={(e) => setWorkOutfitType(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Fabric & Handcraft Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Mulberry Silk with Antique Gold Aari Work"
                      value={workFabric}
                      onChange={(e) => setWorkFabric(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#78716c", display: "block", marginBottom: "4px" }}>
                      Description & Work Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Details about silhouette, flair, craftsmanship, and event suitability..."
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e7e5e4" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWorkUploadModal(false);
                        setEditingShowcaseWork(null);
                      }}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #e7e5e4",
                        backgroundColor: "#ffffff",
                        color: "#78716c",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingS3}
                      style={{
                        backgroundColor: "#be185d",
                        color: "#ffffff",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {editingShowcaseWork ? "Update Showcase Work" : "Publish to Showcase"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fdfafb",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ position: "relative", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="couture-loader-ring" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #be185d 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 8px 24px rgba(190, 24, 93, 0.35)",
                animation: "pulseGlow 2s infinite ease-in-out",
              }}
            >
              <Scissors size={22} />
            </div>
          </div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1c1917", letterSpacing: "0.5px" }}>
            JO DESIGNERS ATELIER
          </div>
        </div>
      }
    >
      <StudioDashboard />
    </Suspense>
  );
}

