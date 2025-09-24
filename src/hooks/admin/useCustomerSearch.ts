import { useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { Customer } from "@/types/orders";

export function useCustomerSearch() {
  const { token, sessionChecked } = useAppSelector((state) => state.auth);

  // Customer data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Fetch latest 4 customers on component mount
  useEffect(() => {
    // Only fetch when session has been checked and we have a token
    if (!sessionChecked) {
      console.log("useCustomerSearch - Session not yet checked, waiting...");
      return;
    }

    if (!token) {
      console.log("useCustomerSearch - No token available after session check");
      setCustomers([]);
      setLoadingCustomers(false);
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);

        // Include authorization header
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log("useCustomerSearch - Sending request with auth token");
        }

        const response = await fetch(
          "/api/admin/customers?limit=4&sort=createdAt&order=desc",
          { headers }
        );
        const data = await response.json();

        console.log("useCustomerSearch - Response status:", response.status);
        console.log("useCustomerSearch - Response data:", data);

        if (data.success && data.data && data.data.items) {
          setCustomers(data.data.items);
        } else {
          console.error("Failed to fetch customers:", data.message);
          // Fallback to empty array
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [token, sessionChecked]);

  // Customer search logic
  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingCustomers(true);

    try {
      // Include authorization header
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Real API call to search customers
      const response = await fetch(
        `/api/admin/customers?search=${encodeURIComponent(
          searchTerm
        )}&limit=10`,
        { headers }
      );
      const data = await response.json();

      if (data.success && data.data && data.data.items) {
        setSearchResults(data.data.items);
      } else {
        console.error("Failed to search customers:", data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      setSearchResults([]);
    } finally {
      setSearchingCustomers(false);
      setShowCustomerDropdown(true);
    }
  };

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);
    searchCustomers(searchTerm);
  };

  const selectCustomer = (customer: Customer) => {
    // Find default address or first address
    const defaultAddress =
      customer.addresses.find((addr) => addr.isDefault) ||
      customer.addresses[0];

    setCustomerSearchTerm(customer.fullName || customer.phone || "");
    setShowCustomerDropdown(false);

    return {
      customer,
      defaultAddressId: defaultAddress?.id || "",
    };
  };

  const clearCustomerSearch = () => {
    setCustomerSearchTerm("");
    setShowCustomerDropdown(false);
    setSearchResults([]);
  };

  return {
    // Recent customers data
    customers,
    loadingCustomers,

    // Search state
    customerSearchTerm,
    searchingCustomers,
    searchResults,
    showCustomerDropdown,

    // Actions
    handleCustomerSearch,
    selectCustomer,
    clearCustomerSearch,
    setShowCustomerDropdown,
  };
}
