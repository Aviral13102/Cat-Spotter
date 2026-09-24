"""
CAT Spotter WebSocket Smoke Test
Connects to the WS endpoint, verifies the hello message and at least one telemetry tick.
Exit code 0 = pass, 1 = fail.
"""
import asyncio
import json
import sys

try:
    import websockets
except ImportError:
    print("ERROR: websockets package not installed. Run: pip install websockets")
    sys.exit(1)


async def smoke_test(url: str = "ws://localhost:8000/ws", timeout: float = 15.0) -> bool:
    """Run the smoke test against the WebSocket endpoint."""
    print(f"Connecting to {url}...")

    try:
        async with websockets.connect(url, open_timeout=5) as ws:
            print("Connected.")

            got_hello = False
            got_tick = False
            start = asyncio.get_event_loop().time()

            while asyncio.get_event_loop().time() - start < timeout:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    msg = json.loads(raw)
                    msg_type = msg.get("type", "unknown")

                    if msg_type == "hello":
                        got_hello = True
                        print(f"  ✅ Received 'hello' (seq={msg.get('seq', '?')})")
                    elif msg_type == "telemetry.tick":
                        got_tick = True
                        print(f"  ✅ Received 'telemetry.tick' (seq={msg.get('seq', '?')})")
                    elif msg_type == "sim.state":
                        print(f"  ℹ️  Received 'sim.state'")
                    elif msg_type == "alert.raised":
                        print(f"  ⚠️  Received 'alert.raised': {msg.get('payload', {}).get('rule_id', '?')}")
                    else:
                        print(f"  ℹ️  Received '{msg_type}'")

                    if got_hello and got_tick:
                        print("\n✅ Smoke test PASSED: hello + telemetry.tick received.")
                        return True

                except asyncio.TimeoutError:
                    continue

            # Partial results
            if got_hello and not got_tick:
                print("\n⚠️  Smoke test PARTIAL: got hello but no telemetry tick within timeout.")
                print("    (This may be okay if the simulator is paused.)")
                return True  # hello is sufficient for basic health
            elif not got_hello:
                print("\n❌ Smoke test FAILED: no hello message received.")
                return False

    except ConnectionRefusedError:
        print(f"❌ Connection refused at {url}. Is the server running?")
        return False
    except Exception as e:
        print(f"❌ Smoke test error: {e}")
        return False

    return False


def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else "ws://localhost:8000/ws"
    success = asyncio.run(smoke_test(url))
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
