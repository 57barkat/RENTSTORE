import { SafetyDetailsData } from "@/app/upload/SafetyDetailsScreen";
import { BillType } from "@/app/upload/WeekendPricingScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { Description } from "@/types/ListingDescriptionHighlightsScreen.types";
import { CapacityState } from "@/types/PropertyDetails.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PropertyHostOption } from "@/utils/propertyTypes";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCreatePropertyMutation } from "@/services/api";
import { useAuth } from "./AuthContext";
import Constants from "expo-constants";

const CLOUDINARY_CLOUD_NAME =
  Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME ||
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  Constants.expoConfig?.extra?.UPLOAD_PRESET ||
  process.env.EXPO_PUBLIC_UPLOAD_PRESET ||
  process.env.UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const MAX_PARALLEL_UPLOADS = 3;
const PROPERTY_UPLOAD_QUEUE_STORAGE_KEY = "property-upload-queue";

const getMimeTypeFromUri = (fileUri: string) => {
  const normalizedUri = fileUri.split("?")[0].toLowerCase();

  if (normalizedUri.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedUri.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalizedUri.endsWith(".heic") || normalizedUri.endsWith(".heif")) {
    return "image/heic";
  }

  return "image/jpeg";
};

const getFileNameFromUri = (fileUri: string) => {
  const normalizedUri = fileUri.split("?")[0];
  const segments = normalizedUri.split("/");
  const lastSegment = segments[segments.length - 1];

  return lastSegment || `property_image_${Date.now()}.jpg`;
};

const uploadToCloudinary = async (fileUri: string): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME or UPLOAD_PRESET.",
    );
  }

  if (!fileUri) {
    throw new Error("No image file URI was provided for upload.");
  }

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: getMimeTypeFromUri(fileUri),
    name: getFileNameFromUri(fileUri),
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const rawError = await response.text();
    let errorMessage = "Cloudinary upload failed";

    try {
      const errorData = JSON.parse(rawError);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      if (rawError) {
        errorMessage = rawError;
      }
    }

    throw new Error(
      `Cloudinary upload failed (${response.status}): ${errorMessage}`,
    );
  }

  const result = await response.json();

  if (!result.secure_url) {
    throw new Error(
      "Cloudinary upload succeeded but no secure_url was returned.",
    );
  }

  return result.secure_url;
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex++;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
};

const cloneFormPayload = (value: FormData): FormData => {
  return JSON.parse(JSON.stringify(value)) as FormData;
};

const createQueueId = () => {
  return `property-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  ) {
    return String(error.data.message);
  }

  return "Unable to upload this property right now.";
};

export interface SubmitResult {
  success: boolean;
  data?: any;
  error?: unknown;
}

export interface FormData {
  _id?: string;
  propertyType?: PropertyHostOption;
  title?: string;
  description?: Description;
  address?: Address[];
  hostOption?: PropertyHostOption;
  location?: string;
  lat?: number;
  lng?: number;
  area?: string;
  capacityState?: CapacityState;
  amenities?: string[];
  photos?: string[];
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  defaultRentType?: "daily" | "weekly" | "monthly";
  securityDeposit?: number;
  ALL_BILLS?: BillType[];
  safetyDetailsData?: SafetyDetailsData;
  status?: boolean;
  SecuritybasePrice?: number;
  size?: {
    value?: number;
    unit?: "Marla" | "Kanal" | "Sq. Ft." | "Sq. Yd.";
  };
  apartmentType?: "studio" | "1BHK" | "2BHK" | "3BHK" | "penthouse";
  furnishing?: "furnished" | "semi-furnished" | "unfurnished";
  parking?: boolean;
  hostelType?: "male" | "female" | "mixed";
  mealPlan?: string[];
  rules?: string[];
}

export interface QueuedPropertyUpload {
  queueId: string;
  createdAt: number;
  updatedAt: number;
  payload: FormData;
  status: "queued" | "uploading" | "failed";
  error?: string;
  progress?: {
    phase: "queued" | "uploading_images" | "submitting";
    totalImages: number;
    completedImages: number;
    activeImageNumbers: number[];
  };
}

export interface FormContextType {
  data: FormData;
  updateForm: <K extends keyof FormData>(step: K, values: FormData[K]) => void;
  setFullFormData: (newData: FormData) => void;
  submitData: (overrideData?: FormData) => Promise<SubmitResult>;
  submitDraftData: (overrideData?: FormData) => Promise<SubmitResult>;
  clearForm: () => void;
  uploadQueue: QueuedPropertyUpload[];
  pendingUploadsCount: number;
  failedUploadsCount: number;
  retryFailedUploads: () => Promise<void>;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined,
);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FormData>({});
  const [uploadQueue, setUploadQueue] = useState<QueuedPropertyUpload[]>([]);
  const [queueHydrated, setQueueHydrated] = useState(false);
  const [createProperty] = useCreatePropertyMutation();
  const { updateUser } = useAuth();
  const uploadQueueRef = useRef<QueuedPropertyUpload[]>([]);
  const isProcessingQueueRef = useRef(false);

  const persistQueue = useCallback(async (queue: QueuedPropertyUpload[]) => {
    try {
      await AsyncStorage.setItem(
        PROPERTY_UPLOAD_QUEUE_STORAGE_KEY,
        JSON.stringify(queue),
      );
    } catch (error) {
      console.warn("Failed to persist property upload queue", error);
    }
  }, []);

  const setUploadQueueAndPersist = useCallback(
    (
      updater:
        | QueuedPropertyUpload[]
        | ((current: QueuedPropertyUpload[]) => QueuedPropertyUpload[]),
    ) => {
      setUploadQueue((current) => {
        const next =
          typeof updater === "function"
            ? (
                updater as (
                  value: QueuedPropertyUpload[],
                ) => QueuedPropertyUpload[]
              )(current)
            : updater;

        uploadQueueRef.current = next;
        void persistQueue(next);
        return next;
      });
    },
    [persistQueue],
  );

  const updateQueuedUpload = useCallback(
    (
      queueId: string,
      updater: (item: QueuedPropertyUpload) => QueuedPropertyUpload,
    ) => {
      setUploadQueueAndPersist((current) =>
        current.map((item) =>
          item.queueId === queueId ? updater(item) : item,
        ),
      );
    },
    [setUploadQueueAndPersist],
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateQueue = async () => {
      try {
        const rawQueue = await AsyncStorage.getItem(
          PROPERTY_UPLOAD_QUEUE_STORAGE_KEY,
        );

        if (!isMounted) {
          return;
        }

        const parsedQueue = rawQueue
          ? (JSON.parse(rawQueue) as QueuedPropertyUpload[])
          : [];

        uploadQueueRef.current = parsedQueue;
        setUploadQueue(parsedQueue);
      } catch (error) {
        console.warn("Failed to hydrate property upload queue", error);
      } finally {
        if (isMounted) {
          setQueueHydrated(true);
        }
      }
    };

    void hydrateQueue();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateForm: FormContextType["updateForm"] = (step, values) => {
    setData((prev) => ({ ...prev, [step]: values }));
  };

  const setFullFormData: FormContextType["setFullFormData"] = (newData) => {
    setData({ ...newData });
  };

  const processQueue = useCallback(async () => {
    if (!queueHydrated || isProcessingQueueRef.current) {
      return;
    }

    isProcessingQueueRef.current = true;

    try {
      while (true) {
        const nextItem = uploadQueueRef.current.find(
          (item) => item.status === "queued",
        );

        if (!nextItem) {
          break;
        }

        const payload = cloneFormPayload(nextItem.payload);
        const sourcePhotos = payload.photos || [];
        const uploadTargets = sourcePhotos
          .map((uri, index) => ({ uri, index }))
          .filter((item) => !item.uri.startsWith("http"))
          .map((item, index) => ({
            ...item,
            imageNumber: index + 1,
          }));

        try {
          updateQueuedUpload(nextItem.queueId, (item) => ({
            ...item,
            status: "uploading",
            error: undefined,
            updatedAt: Date.now(),
            progress: {
              phase:
                uploadTargets.length > 0 ? "uploading_images" : "submitting",
              totalImages: uploadTargets.length,
              completedImages: 0,
              activeImageNumbers: [],
            },
          }));

          if (uploadTargets.length > 0) {
            const uploadedEntries = await mapWithConcurrency(
              uploadTargets,
              MAX_PARALLEL_UPLOADS,
              async (target) => {
                updateQueuedUpload(nextItem.queueId, (item) => ({
                  ...item,
                  updatedAt: Date.now(),
                  progress: {
                    phase: "uploading_images",
                    totalImages: uploadTargets.length,
                    completedImages: item.progress?.completedImages || 0,
                    activeImageNumbers: Array.from(
                      new Set([
                        ...(item.progress?.activeImageNumbers || []),
                        target.imageNumber,
                      ]),
                    ).sort((left, right) => left - right),
                  },
                }));

                const uploadedUrl = await uploadToCloudinary(target.uri);

                updateQueuedUpload(nextItem.queueId, (item) => ({
                  ...item,
                  updatedAt: Date.now(),
                  progress: {
                    phase: "uploading_images",
                    totalImages: uploadTargets.length,
                    completedImages: Math.min(
                      uploadTargets.length,
                      (item.progress?.completedImages || 0) + 1,
                    ),
                    activeImageNumbers: (
                      item.progress?.activeImageNumbers || []
                    )
                      .filter(
                        (imageNumber) => imageNumber !== target.imageNumber,
                      )
                      .sort((left, right) => left - right),
                  },
                }));

                return {
                  index: target.index,
                  uploadedUrl,
                };
              },
            );

            payload.photos = [...sourcePhotos];
            uploadedEntries.forEach((entry) => {
              payload.photos![entry.index] = entry.uploadedUrl;
            });
          }

          updateQueuedUpload(nextItem.queueId, (item) => ({
            ...item,
            updatedAt: Date.now(),
            progress: {
              phase: "submitting",
              totalImages: uploadTargets.length,
              completedImages: uploadTargets.length,
              activeImageNumbers: [],
            },
          }));

          const response = await createProperty(payload).unwrap();

          if (response.user) {
            await updateUser(response.user);
          }

          setUploadQueueAndPersist((current) =>
            current.filter((item) => item.queueId !== nextItem.queueId),
          );
        } catch (error) {
          const message = normalizeErrorMessage(error);

          setUploadQueueAndPersist((current) =>
            current.map((item) =>
              item.queueId === nextItem.queueId
                ? {
                    ...item,
                    status: "failed",
                    error: message,
                    updatedAt: Date.now(),
                  }
                : item,
            ),
          );
        }
      }
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [
    createProperty,
    queueHydrated,
    setUploadQueueAndPersist,
    updateQueuedUpload,
    updateUser,
  ]);

  useEffect(() => {
    if (!queueHydrated) {
      return;
    }

    const hasQueuedItems = uploadQueue.some((item) => item.status === "queued");

    if (hasQueuedItems) {
      void processQueue();
    }
  }, [processQueue, queueHydrated, uploadQueue]);

  const enqueueSubmission = useCallback(
    async (source: FormData): Promise<SubmitResult> => {
      const payload = cloneFormPayload(source);
      const queueId = createQueueId();
      const queuedItem: QueuedPropertyUpload = {
        queueId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        payload,
        status: "queued",
        progress: {
          phase: "queued",
          totalImages: (payload.photos || []).filter(
            (uri) => !uri.startsWith("http"),
          ).length,
          completedImages: 0,
          activeImageNumbers: [],
        },
      };

      setUploadQueueAndPersist((current) => [...current, queuedItem]);

      return {
        success: true,
        data: {
          queued: true,
          queueId,
        },
      };
    },
    [setUploadQueueAndPersist],
  );

  const submitData: FormContextType["submitData"] = async (overrideData) => {
    try {
      const sourceData = overrideData ?? data;
      return await enqueueSubmission(sourceData);
    } catch (error) {
      console.error("Queueing failed:", error);
      return { success: false, error };
    }
  };

  const submitDraftData: FormContextType["submitDraftData"] = async (
    overrideData,
  ) => {
    try {
      const payload = cloneFormPayload(overrideData ?? data);
      payload.status = false;
      const response = await createProperty(payload).unwrap();

      if (response.user) {
        await updateUser(response.user);
      }

      return { success: true, data: response };
    } catch (error) {
      console.error("Draft save failed:", error);
      return { success: false, error };
    }
  };

  const retryFailedUploads = useCallback(async () => {
    setUploadQueueAndPersist((current) =>
      current.map((item) =>
        item.status === "failed"
          ? {
              ...item,
              status: "queued",
              error: undefined,
              updatedAt: Date.now(),
              progress: {
                phase: "queued",
                totalImages: (item.payload.photos || []).filter(
                  (uri) => !uri.startsWith("http"),
                ).length,
                completedImages: 0,
                activeImageNumbers: [],
              },
            }
          : item,
      ),
    );
  }, [setUploadQueueAndPersist]);

  const clearForm = () => setData({});

  const pendingUploadsCount = useMemo(() => {
    return uploadQueue.filter(
      (item) => item.status === "queued" || item.status === "uploading",
    ).length;
  }, [uploadQueue]);

  const failedUploadsCount = useMemo(() => {
    return uploadQueue.filter((item) => item.status === "failed").length;
  }, [uploadQueue]);

  return (
    <FormContext.Provider
      value={{
        data,
        updateForm,
        setFullFormData,
        submitData,
        submitDraftData,
        clearForm,
        uploadQueue,
        pendingUploadsCount,
        failedUploadsCount,
        retryFailedUploads,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
