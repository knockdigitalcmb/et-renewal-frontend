import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { API_BASE_URL } from "../config/api";

const VehicleTypeContext = createContext();

export const useVehicleType = () =>
  useContext(VehicleTypeContext);

const API_URL = API_BASE_URL;

export const VehicleTypeProvider = ({
  children,
}) => {
  const [vehicleTypes, setVehicleTypes] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(false);

  // ======================
  // GET ALL VEHICLE TYPES
  // ======================

  const fetchVehicleTypes =
    async () => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem(
            "accessToken"
          );
        // console.log("TOKEN =", token);
        // console.log("HEADER =", `Bearer ${token}`);

        const response =
          await fetch(
            `${API_URL}/vehicle-types`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (result.success) {
          const formattedData =
            result.data.map(
              (item) => ({
                id: item.id,
                name:
                  item.vehicle_type_name,
                description:
                  item.vehicle_type_desc,
                status:
                  item.is_active
                    ? "Active"
                    : "Inactive",
                createdDate:
                  item.created_at,
              })
            );

          setVehicleTypes(
            formattedData
          );
        }
      } catch (error) {
        console.error(
          "Fetch Vehicle Types Error:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  // ======================
  // CREATE VEHICLE TYPE
  // ======================

  const addVehicleType =
    async (data) => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem(
            "accessToken"
          );
        // console.log("TOKEN =", token);
        // console.log("TOKENvehicleTypeName =", data.name);
        const response =
          await fetch(
            `${API_URL}/vehicle-types`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                vehicleTypeName:
                  data.name,
                vehicleTypeDesc:
                  data.name,
                isActive:
                  data.status ===
                  "Active",
              }),
            }
          );

        const result =
          await response.json();

        if (result.success) {
          await fetchVehicleTypes();

          return {
            success: true,
          };
        }

        return {
          success: false,
          message:
            result.message,
        };
      } catch (error) {
        console.error(
          "Create Vehicle Type Error:",
          error
        );

        return {
          success: false,
          message:
            "Server Error",
        };
      } finally {
        setIsLoading(false);
      }
    };

  // ======================
  // UPDATE VEHICLE TYPE
  // ======================

  const updateVehicleType =
    async (id, data) => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem(
            "accessToken"
          );

        const response =
          await fetch(
            `${API_URL}/vehicle-types/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                vehicleTypeName:
                  data.name,
                vehicleTypeDesc:
                  data.name,
                isActive:
                  data.status ===
                  "Active",
              }),
            }
          );

        const result =
          await response.json();

        if (result.success) {
          await fetchVehicleTypes();

          return {
            success: true,
          };
        }

        return {
          success: false,
          message:
            result.message,
        };
      } catch (error) {
        console.error(
          "Update Vehicle Type Error:",
          error
        );

        return {
          success: false,
          message:
            "Server Error",
        };
      } finally {
        setIsLoading(false);
      }
    };

  // ======================
  // DELETE VEHICLE TYPE
  // ======================

  const deleteVehicleType =
    async (id) => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem(
            "accessToken"
          );

        const response =
          await fetch(
            `${API_URL}/vehicle-types/${id}`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (result.success) {
          await fetchVehicleTypes();

          return {
            success: true,
          };
        }

        return {
          success: false,
          message:
            result.message,
        };
      } catch (error) {
        console.error(
          "Delete Vehicle Type Error:",
          error
        );

        return {
          success: false,
          message:
            "Server Error",
        };
      } finally {
        setIsLoading(false);
      }
    };

  // ======================
  // GET VEHICLE TYPE BY ID
  // ======================

  const getVehicleType =
    async (id) => {
      try {
        const token =
          localStorage.getItem(
            "accessToken"
          );

        const response =
          await fetch(
            `${API_URL}/vehicle-types/${id}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (result.success) {
          return {
            id:
              result.data.id,
            name:
              result.data
                .vehicle_type_name,
            description:
              result.data
                .vehicle_type_desc,
            status:
              result.data
                .is_active
                ? "Active"
                : "Inactive",
            createdDate:
              result.data
                .created_at,
          };
        }

        return null;
      } catch (error) {
        console.error(
          "Get Vehicle Type Error:",
          error
        );

        return null;
      }
    };

  // ======================
  // CHECK DUPLICATE VEHICLE TYPE
  // ======================

  const checkDuplicateVehicleType = (name, excludeId = null) => {
    const lowerName = name.toLowerCase().trim();
    return vehicleTypes.some(
      (t) => t.name.toLowerCase().trim() === lowerName && t.id !== excludeId
    );
  };

  return (
    <VehicleTypeContext.Provider
      value={{
        vehicleTypes,
        fetchVehicleTypes,
        addVehicleType,
        updateVehicleType,
        deleteVehicleType,
        getVehicleType,
        checkDuplicateVehicleType,
        isLoading,
      }}
    >
      {children}
    </VehicleTypeContext.Provider>
  );
};