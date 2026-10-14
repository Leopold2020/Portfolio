import L from "leaflet";
import { useEffect, useId, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { GradientBorderButton } from "@/components//GradientButton";
import Button from "@/components/Button";
import { Input } from "@/components/Input";
import Modal from "@/components/Modal";

export interface PickedLocation {
  address: string;
  lat: number;
  lng: number;
}

interface NominatimAddressDetails {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  postcode?: string;
}

interface AddressSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  address: NominatimAddressDetails;
}

// Need to change to our own icon

const PIN_ICON = L.divIcon({
  className: "",
  html: '<div style="width:20px;height:20px;background:#3b82f6;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.4)"></div>',
  iconAnchor: [10, 20],
  iconSize: [20, 20],
});

const DEFAULT_MAP_CENTER: [number, number] = [59.3293, 18.0686];
const ADDRESS_SEARCH_DELAY_MS = 1000; // Milliseconds (MINIMUM 1000 or we will be rate limited)
const MAP_CLICK_DELAY_MS = 1000; // Milliseconds (MINIMUM 1000 or we will be rate limited)

function formatAddress(details: NominatimAddressDetails): string {
  const street = [details.road, details.house_number].filter(Boolean).join(" ");
  const city = details.city ?? details.town ?? details.village ?? details.municipality ?? "";
  const postal = [details.postcode, city].filter(Boolean).join(" ");
  return [street, postal].filter(Boolean).join("\n");
}

async function fetchAddressSuggestions(query: string): Promise<AddressSearchResult[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
    { headers: { "Accept-Language": "en" } },
  );
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

async function fetchAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { "Accept-Language": "en" } },
  );
  if (!response.ok) throw new Error(String(response.status));
  const data = (await response.json()) as { address: NominatimAddressDetails };
  return formatAddress(data.address);
}

function MapClickHandler({ onPin }: { onPin: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => {
      onPin(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapResizer({ isMapOpen }: { isMapOpen: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (isMapOpen) map.invalidateSize();
  }, [isMapOpen, map]);
  return null;
}

interface AddressPickerProps {
  onChange: (picked: PickedLocation | null) => void;
  value: PickedLocation | null;
}

export function AddressPicker({ value, onChange }: AddressPickerProps) {
  const mapModalId = useId();
  const [inputText, setInputText] = useState(value?.address.replace("\n", ", ") ?? "");
  const [suggestions, setSuggestions] = useState<AddressSearchResult[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const mapClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSuggestionFetch = useRef(false);

  useEffect(() => {
    if (skipNextSuggestionFetch.current) {
      skipNextSuggestionFetch.current = false;
      return;
    }
    if (inputText.length < 3) {
      setSuggestions([]);
      setSuggestionError(null);
      return;
    }
    const timer = setTimeout(() => {
      fetchAddressSuggestions(inputText)
        .then((results) => {
          setSuggestions(results);
          setSuggestionError(null);
        })
        .catch((error: Error) =>
          setSuggestionError(
            error.message === "429"
              ? "Too many requests. Please wait a moment and try again."
              : "Could not load address suggestions. Please try again.",
          ),
        );
    }, ADDRESS_SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [inputText]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputText(event.target.value);
    onChange(null);
  }

  function handleSuggestionSelect(result: AddressSearchResult) {
    const formatted = formatAddress(result.address) || result.display_name;
    const picked: PickedLocation = {
      address: formatted,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    skipNextSuggestionFetch.current = true;
    setInputText(formatted.replace("\n", ", "));
    setSuggestions([]);
    onChange(picked);
  }

  function openMap() {
    setPendingPin(value ? { lat: value.lat, lng: value.lng } : null);
    setPendingAddress(value?.address ?? null);
    setIsMapOpen(true);
  }

  function closeMap() {
    if (mapClickTimerRef.current) clearTimeout(mapClickTimerRef.current);
    setIsMapOpen(false);
    setPendingPin(null);
    setPendingAddress(null);
  }

  function confirmMapSelection() {
    if (pendingPin !== null && pendingAddress !== null) {
      const picked: PickedLocation = {
        address: pendingAddress,
        lat: pendingPin.lat,
        lng: pendingPin.lng,
      };
      skipNextSuggestionFetch.current = true;
      setInputText(pendingAddress.replace("\n", ", "));
      onChange(picked);
    }
    setIsMapOpen(false);
  }

  function handleMapClick(lat: number, lng: number) {
    setPendingPin({ lat, lng });
    setPendingAddress(null);
    setAddressLookupError(null);
    if (mapClickTimerRef.current) clearTimeout(mapClickTimerRef.current);
    mapClickTimerRef.current = setTimeout(() => {
      fetchAddressFromCoordinates(lat, lng)
        .then(setPendingAddress)
        .catch((error: Error) =>
          setAddressLookupError(
            error.message === "429"
              ? "Too many requests. Please wait a moment and try again."
              : "Could not look up address for this location. Please try again.",
          ),
        );
    }, MAP_CLICK_DELAY_MS);
  }

  const mapCenter: [number, number] = value ? [value.lat, value.lng] : DEFAULT_MAP_CENTER;

  return (
    <div className="relative">
      <div className="relative">
        <Input
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          onChange={handleInputChange}
          placeholder="Search address..."
          type="text"
          value={inputText}
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg bg-white text-left text-black text-sm shadow-lg">
            {suggestions.map((suggestion) => (
              <li
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                key={suggestion.place_id}
                onMouseDown={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {suggestionError && <p className="mt-1 text-red-500 text-sm">{suggestionError}</p>}

      <button className="mt-2 text-black/80 text-sm underline hover:text-pink-500" onClick={openMap} type="button">
        Or pick on map
      </button>

      <Modal id={mapModalId} isOpen={isMapOpen} onClose={closeMap}>
        {isMapOpen && (
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white text-left">
            <div className="relative h-64 w-full">
              <MapContainer center={mapCenter} className="h-full w-full" zoom={13}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onPin={handleMapClick} />
                <MapResizer isMapOpen={isMapOpen} />
                {pendingPin && <Marker icon={PIN_ICON} position={[pendingPin.lat, pendingPin.lng]} />}
              </MapContainer>
            </div>

            <div className="flex flex-col gap-5 bg-white p-5">
              <div>
                <h3 className="font-semibold text-black text-xl">Pick location</h3>
                <p className="mt-1 text-gray-500 text-sm">
                  Click on the map to drop a pin. We'll look up the nearest address.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-black text-xs tracking-wide">Address</p>
                  <div className="mt-1 min-h-[2.5rem] text-sm">
                    {pendingAddress ? (
                      <div className="text-gray-800">
                        {pendingAddress.split("\n").map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      pendingPin && !addressLookupError && <p className="text-gray-400">Loading address...</p>
                    )}
                  </div>
                </div>

                {addressLookupError && <p className="text-red-500 text-sm">{addressLookupError}</p>}
              </div>

              <div className="mt-auto flex flex-col items-center justify-center gap-2 pt-4">
                <Button
                  className="w-full"
                  disabled={pendingPin === null || pendingAddress === null}
                  onClick={confirmMapSelection}
                  type="button"
                  variant="secondary"
                >
                  OK
                </Button>
                <GradientBorderButton className="w-full" onClick={closeMap} type="button">
                  Cancel
                </GradientBorderButton>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
