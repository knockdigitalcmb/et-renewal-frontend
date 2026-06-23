import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const DeviceModelContext =
  createContext();

export const useDeviceModel =
  () => {
    return useContext(
      DeviceModelContext
    );
  };

const API_URL =
  "http://103.235.105.121:3000/api/v1";

export const DeviceModelProvider =
  ({ children }) => {
    const [deviceModels,
      setDeviceModels] =
      useState([]);

    const [isLoading,
      setIsLoading] =
      useState(false);

    // ======================
    // GET ALL DEVICE MODELS
    // ======================

    const fetchDeviceModels =
      async () => {
        try {
          setIsLoading(true);

          const token =
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(
              `${API_URL}/device-models`,
              {
                method: "GET",
                headers: {
                  "Authorization":
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response.json();

          if (
            result.success
          ) {
            const formattedData =
              result.data.map(
                (item) => ({
                  id: item.id,
                  name:
                    item.model_name,
                  manufacturer:
                    item.model_manufacturer,
                  description:
                    item.model_desc,
                  status:
                    item.is_active
                      ? "Active"
                      : "Inactive",
                  createdAt:
                    item.created_at,
                  updatedAt:
                    item.updated_at,
                })
              );

            setDeviceModels(
              formattedData
            );
          }
        } catch (error) {
          console.error(
            "Fetch Device Models Error:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

    useEffect(() => {
      fetchDeviceModels();
    }, []);

    // ======================
    // CREATE DEVICE MODEL
    // ======================

    const addDeviceModel =
      async (data) => {
        try {
          setIsLoading(true);

          const token =
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(
              `${API_URL}/device-models`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                  "Authorization":
                    `Bearer ${token}`,
                },
                body:
                  JSON.stringify({
                    modelName:
                      data.name,
                    modelManufacturer:
                      data.manufacturer ||
                      null,
                    modelDesc:
                      data.description ||
                      "",
                    isActive:
                      data.status ===
                      "Active",
                  }),
              }
            );

          const result =
            await response.json();

          if (
            result.success
          ) {
            await fetchDeviceModels();

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
            "Create Device Model Error:",
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
    // UPDATE DEVICE MODEL
    // ======================

    const updateDeviceModel =
      async (
        id,
        data
      ) => {
        try {
          setIsLoading(true);

          const token =
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(
              `${API_URL}/device-models/${id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type":
                    "application/json",
                  "Authorization":
                    `Bearer ${token}`,
                },
                body:
                  JSON.stringify({
                    modelName:
                      data.name,
                    modelManufacturer:
                      data.manufacturer ||
                      null,
                    modelDesc:
                      data.description ||
                      "",
                    isActive:
                      data.status ===
                      "Active",
                  }),
              }
            );

          const result =
            await response.json();

          if (
            result.success
          ) {
            await fetchDeviceModels();

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
            "Update Device Model Error:",
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
    // DELETE DEVICE MODEL
    // ======================

    const deleteDeviceModel =
      async (id) => {
        try {
          setIsLoading(true);

          const token =
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(
              `${API_URL}/device-models/${id}`,
              {
                method:
                  "DELETE",
                headers: {
                  "Authorization":
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response.json();

          if (
            result.success
          ) {
            await fetchDeviceModels();

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
            "Delete Device Model Error:",
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
    // GET MODEL BY ID
    // ======================

    const getDeviceModel =
      async (id) => {
        try {
          const token =
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(
              `${API_URL}/device-models/${id}`,
              {
                method:
                  "GET",
                headers: {
                  "Authorization":
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response.json();

          if (
            result.success
          ) {
            return {
              id:
                result.data.id,
              name:
                result.data
                  .model_name,
              manufacturer:
                result.data
                  .model_manufacturer,
              description:
                result.data
                  .model_desc,
              status:
                result.data
                  .is_active
                  ? "Active"
                  : "Inactive",
              createdAt:
                result.data
                  .created_at,
              updatedAt:
                result.data
                  .updated_at,
            };
          }

          return null;
        } catch (error) {
          console.error(
            "Get Device Model Error:",
            error
          );

          return null;
        }
      };

    return (
      <DeviceModelContext.Provider
        value={{
          deviceModels,
          fetchDeviceModels,
          addDeviceModel,
          updateDeviceModel,
          deleteDeviceModel,
          getDeviceModel,
          isLoading,
        }}
      >
        {children}
      </DeviceModelContext.Provider>
    );
  };