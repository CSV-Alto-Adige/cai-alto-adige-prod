"use client";

import React, {
  useContext,
  useRef,
  useEffect,
  useState,
  createRef,
} from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartContext } from "@/store/cart-context";
import CartEvent from "./cart-product";
import jsPDF from "jspdf";
import { PrintableEventList } from "./print/PrintableEventList";
import { useReactToPrint } from "react-to-print";

export function CartSheet({ events }: any) {
  const [open, setOpen] = useState(false);
  const cart = useContext(CartContext);
  const eventsIndex = React.useMemo(() => {
    const map = new Map<string, any>();
    events?.forEach((e: any) => map.set(e.id, e));
    return map;
  }, [events]);

  // Resolve items to data; separate existing vs missing
  const { existingItems, missingIds } = React.useMemo(() => {
    const existing: any[] = [];
    const missing: string[] = [];
    cart.items.forEach((i) => {
      const data = eventsIndex.get(i.id);
      if (data) existing.push(data);
      else missing.push(i.id);
    });
    return { existingItems: existing, missingIds: missing };
  }, [cart.items, eventsIndex]);

  // Optional: auto-prune missing favorites so they disappear permanently
  useEffect(() => {
    if (missingIds.length > 0) {
      missingIds.forEach((id) => cart.deleteFromCart(id));
    }
  }, [missingIds, cart]);

  const eventsCount = existingItems.length; // Count only resolvable items
  const { itemAdded, resetItemAdded } = useContext(CartContext);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (itemAdded) {
      sheetTriggerRef.current?.click();
      resetItemAdded();
    }
  }, [itemAdded, resetItemAdded]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild ref={sheetTriggerRef}>
        <Button className="ml-6 relative inline-flex items-center bg-[#0e4d71] font-semibold text-sm lg:text-base">
          Favoriti
          <Heart className="ml-2 h-4 w-4" />
          {eventsCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-thin leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {eventsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-scroll flex flex-col justify-between">
        <div id="wishlist">
          <SheetHeader>
            <SheetTitle>I tuoi favoriti</SheetTitle>
            <SheetDescription>Esporta la tua lista.</SheetDescription>
          </SheetHeader>

          {eventsCount > 0 ? (
            <>
              {existingItems.map((ev) => (
                <div key={ev.id} id={`cart-item-${ev.id}`}>
                  <CartEvent
                    events={events}
                    id={ev.id}
                    open={open}
                    setOpen={setOpen}
                  />
                </div>
              ))}
            </>
          ) : (
            <p className="mt-12">
              Non hai aggiunto nessuna attività alla tua lista.
            </p>
          )}

          {/* (Optional) Inform user if some items were removed because they no longer exist */}
          {missingIds.length > 0 && (
            <p className="mt-4 text-xs text-zinc-500">
              {missingIds.length} elemento/i non più disponibili sono stati
              rimossi dai preferiti.
            </p>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            {/* Never pass undefined to PrintableEventList */}
            <PrintableEventList events={existingItems} />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
