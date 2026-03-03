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

      return;
    }

    if (!token) {

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

        }

        const response = await fetch(
          "/api/admin/customers?limit=4&sort=createdAt&order=desc",
          { headers }
        );
        const data = await response.json();


        if (data.success && data.data && data.data.items) {
          setCustomers(data.data.items);
        } else {

          // Fallback to empty array
          setCustomers([]);
        }
      } catch (error) {

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

        setSearchResults([]);
      }
    } catch (error) {

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

    setCustomerSearchTerm(
      customer.fullName ||
        customer.customerPhones?.find((phone) => phone.isMain)?.phoneNumber ||
        customer.customerPhones?.[0]?.phoneNumber ||
        ""
    );
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
