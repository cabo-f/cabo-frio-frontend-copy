"use client";
import { API_URL } from "@/consts/api_url";
import dayjs, { Dayjs } from "dayjs";
import { createContext, useEffect, useState } from "react";
import { type Client } from "@/consts/clients";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Order {
  _id?: string;
  local: string;
  totalPrice: number;
  paymentMethod: "cash" | "mercado_pago" | "card";
  description: {
    item: string;
    quantity: number;
    type: string;
  }[];
  createdAt: Dayjs;
  client: Client;
}

interface OrdersContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => Promise<Response>;
  getOrders: () => Promise<void>;
  getOrdersByLocal: (local: string) => Promise<void>;
  getOrdersByDate: (date: string) => Promise<void>;
  getByDateAndLocal: (date: string, local: string) => Promise<void>;
  deleteOrderById: (id: string) => Promise<void>;
}

export const OrdersContext = createContext<OrdersContextType | undefined>(
  undefined
);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = async (order: Order): Promise<Response> => {
    try {
      const response = await fetch(`${API_URL}/orders/income`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        return response;
      }

      throw new Error("Error al enviar el pedido");
    } catch {
      return new Response(
        JSON.stringify({ error: "No se pudo enviar el pedido" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };

  const getOrders = async () => {
    try {
      const today = dayjs()
        .add(1, "day")
        .tz("America/Argentina/Buenos_Aires")
        .format("YYYY-MM-DD");
      await getOrdersByDate(today);
    } catch {
      console.error("Error al traer los pedidos");
    }
  };

  const getOrdersByLocal = async (local: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${local}`);
      const data = await response.json();
      setOrders(data);
    } catch {
      console.error("Error al traer los pedidos");
    }
  };

  const getOrdersByDate = async (date: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/date/${date}`);
      const data = await response.json();
      setOrders(data);
    } catch {
      console.error("Error al traer los pedidos");
    }
  };

  const getByDateAndLocal = async (date: string, local: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/date/${date}/${local}`);
      const data = await response.json();
      setOrders(data);
    } catch {
      console.error("Error al traer los pedidos");
    }
  };

  const deleteOrderById = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        getOrders();
      }
    } catch {
      console.error("Error al borrar el pedido");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);
  return (
    <OrdersContext.Provider
      value={{
        orders,
        setOrders,
        addOrder,
        getOrders,
        getOrdersByLocal,
        getOrdersByDate,
        getByDateAndLocal,
        deleteOrderById,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}
