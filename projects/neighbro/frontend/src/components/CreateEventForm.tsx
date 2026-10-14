import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { createEvent } from "@/api/events";
import { AddressPicker, type PickedLocation } from "@/components/AddressPicker";
import { CancelButton } from "@/components/CancelButton";
import { CreateButton } from "@/components/CreateButton";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/textarea";
import type { AppEvent, EventCategory } from "@/types/event";
import SelectableTag from "./SelectableTag";

type Inputs = {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  categories: EventCategory["id"][];
};

export default function CreateEventForm({ categories }: { categories: EventCategory[] }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [address, setAddress] = useState<PickedLocation | null>(null);
  const [addressError, setAddressError] = useState(false);

  const createEventMutation = useMutation<AppEvent, Error, Omit<AppEvent, "id" | "ownerId">>({
    mutationFn: (data) => createEvent(data),
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (address === null) {
      setAddressError(true);
      return;
    }
    setAddressError(false);

    if (import.meta.env.DEV) {
      console.log(data);
    }

    const eventData: Omit<AppEvent, "id" | "ownerId"> = {
      ...data,
      address: address.address,
      latitude: address.lat,
      longitude: address.lng,
    };
    createEventMutation.mutate(eventData);
  };

  return (
    <div className="min-block-full flex items-center justify-center">
      <form
        className="grid content-start justify-items-center gap-4 pt-5 text-center font-500 text-2xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="font-medium text-3xl text-black">Create Event</h2>
        <Input placeholder="Title" {...register("name", { required: true })} />
        {errors.name && <p className="text-red-900 text-sm">Name is required</p>}

        <AddressPicker onChange={setAddress} value={address} />
        {addressError && <p className="text-red-900 text-sm">Address is required</p>}

        <Textarea placeholder="Description" {...register("description", { maxLength: 500, required: true })} />
        {errors.description && <p className="text-red-900 text-sm">Description is required</p>}
        <label className="flex flex-col gap-5 text-[20px] text-black">
          Start date and time?{" "}
          <Input placeholder="Start Time" type="datetime-local" {...register("startTime", { required: true })} />
        </label>

        {errors.startTime && <p className="text-red-900 text-sm">Start Time is required</p>}
        <label className="flex flex-col gap-5 text-[20px] text-black text-sm">
          End date and time?{" "}
          <Input placeholder="End Time" type="datetime-local" {...register("endTime", { required: true })} />
        </label>

        {errors.endTime && <p className="text-red-900 text-sm">End Time is required</p>}

        {/* error message from backend*/}
        {createEventMutation.error && <p className="text-red-900 text-sm">{createEventMutation.error.message}</p>}

        <fieldset className="contents">
          <legend className="font-medium text-[28px] text-black italic">Tags</legend>
          <div className="flex shrink-0 flex-wrap justify-center gap-3.75 py-2.5">
            {categories.map((category) => (
              <SelectableTag key={category.id} text={category.name} value={category.id} {...register("categories")} />
            ))}
          </div>
        </fieldset>

        <div className="sticky bottom-24 flex gap-2">
          <Link to="/profile">
            <CancelButton type="button">Cancel</CancelButton>
          </Link>
          <CreateButton type="submit">Create</CreateButton>
        </div>
      </form>
    </div>
  );
}
