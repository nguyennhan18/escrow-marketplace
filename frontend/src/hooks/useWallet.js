import { useEffect, useRef, useState } from "react";
import { createWalletClient, findMetaMask, walletErrorMessage } from "../services/walletService.js";

const initialState = { available: false, account: null, chainId: null,
  loading: true, connecting: false, error: "" };

export function useWallet() {
  const [wallet, setWallet] = useState(initialState);
  const sessionRef = useRef(null);

  useEffect(() => {
    const ethereum = findMetaMask();
    if (!ethereum) {
      setWallet({ ...initialState, loading: false });
      return;
    }
    const client = createWalletClient(ethereum);
    const session = { client, active: true, revision: 0, connecting: false };
    sessionRef.current = session;
    const refresh = async () => {
      const revision = ++session.revision;
      try {
        const snapshot = await client.read();
        if (session.active && revision === session.revision) {
          setWallet((previous) => ({ ...previous, ...snapshot,
            available: true, loading: false, error: "" }));
        }
      } catch (error) {
        if (session.active && revision === session.revision) {
          setWallet((previous) => ({ ...previous, available: true,
            account: null, chainId: null, loading: false,
            error: walletErrorMessage(error) }));
        }
      }
    };
    session.refresh = refresh;
    const disconnect = () => {
      ++session.revision;
      setWallet((previous) => ({ ...previous, account: null, chainId: null,
        loading: false, error: "MetaMask đã ngắt kết nối. Hãy mở ví và kết nối lại." }));
    };
    ethereum.on("accountsChanged", refresh);
    ethereum.on("chainChanged", refresh);
    ethereum.on("connect", refresh);
    ethereum.on("disconnect", disconnect);
    refresh();
    return () => {
      session.active = false;
      ethereum.removeListener("accountsChanged", refresh);
      ethereum.removeListener("chainChanged", refresh);
      ethereum.removeListener("connect", refresh);
      ethereum.removeListener("disconnect", disconnect);
      client.destroy();
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, []);

  const connect = async () => {
    const session = sessionRef.current;
    if (!session || session.connecting) return;
    session.connecting = true;
    setWallet((previous) => ({ ...previous, connecting: true, error: "" }));
    try {
      await session.client.connect();
      if (session.active) await session.refresh();
    } catch (error) {
      if (session.active) setWallet((previous) => ({ ...previous, error: walletErrorMessage(error) }));
    } finally {
      session.connecting = false;
      if (session.active) setWallet((previous) => ({ ...previous, connecting: false }));
    }
  };
  return { ...wallet, connect };
}
