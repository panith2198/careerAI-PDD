import asyncio
import sys
import httpx
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models.booking import Booking
from app.models.mentor import Mentor
from sqlalchemy import select

async def main():
    print("Testing backend booking completions and slot retrieval...")
    
    # 1. Login user to get JWT token
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {
        "email": "eswarch2004y@gmail.com",
        "password": "password"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # Login
            resp = await client.post(login_url, json=login_data)
            if resp.status_code != 200:
                print("Login failed! Response:", resp.text)
                return
            token = resp.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("Login successful. JWT token received.")
            
            # Find a mentor to test with
            async with AsyncSessionLocal() as session:
                res_m = await session.execute(select(Mentor).where(Mentor.is_available == True))
                mentor = res_m.scalars().first()
                if not mentor:
                    print("No available mentors found in DB to test.")
                    return
                mentor_id = mentor.mentor_id
                print(f"Testing with Mentor ID: {mentor_id}")
            
            # 2. Get mentor details first to see current booked slots
            details_url = f"http://127.0.0.1:8000/api/v1/mentors/{mentor_id}"
            resp_details = await client.get(details_url, headers=headers)
            assert resp_details.status_code == 200
            initial_booked_slots = resp_details.json().get("booked_slots", [])
            print("Initial booked slots:", initial_booked_slots)
            
            # Choose a unique slot not already in the list
            test_slot = "2026-06-25 04:00 PM"
            if test_slot in initial_booked_slots:
                test_slot = "2026-06-25 05:00 PM"
            if test_slot in initial_booked_slots:
                test_slot = "2026-06-25 06:00 PM"
            print(f"Using test slot: {test_slot}")
            
            # 3. Create a session booking
            book_url = "http://127.0.0.1:8000/api/v1/mentors/session/book"
            book_payload = {
                "mentor_id": mentor_id,
                "slot_timestamp": test_slot
            }
            resp_book = await client.post(book_url, json=book_payload, headers=headers)
            print("Book Session Response Status:", resp_book.status_code)
            book_data = resp_book.json()
            booking_id = book_data.get("booking_id")
            print("Booking ID created:", booking_id)
            
            if resp_book.status_code != 201:
                print("Failed to book session. Response:", book_data)
                return
            
            # Let's confirm it in the database directly (since Razorpay is mock mode and we need to simulate confirmed status)
            async with AsyncSessionLocal() as session:
                stmt = select(Booking).where(Booking.booking_id == booking_id)
                res = await session.execute(stmt)
                booking = res.scalar_one_or_none()
                assert booking is not None
                booking.status = "confirmed"
                await session.commit()
                print("Directly confirmed booking status in DB.")
            
            # 4. Fetch mentor details again to verify the slot is now in booked_slots
            resp_details2 = await client.get(details_url, headers=headers)
            booked_slots2 = resp_details2.json().get("booked_slots", [])
            print("Booked slots after confirming:", booked_slots2)
            assert test_slot in booked_slots2, f"Expected {test_slot} to be in booked_slots, but got {booked_slots2}"
            print("[PASS] Confirmed booking slot blocks availability.")
            
            # 5. Call complete session endpoint
            complete_url = f"http://127.0.0.1:8000/api/v1/mentors/session/{booking_id}/complete"
            resp_complete = await client.post(complete_url, headers=headers)
            print("Complete Session Response Status:", resp_complete.status_code)
            assert resp_complete.status_code == 200, f"Expected 200, got {resp_complete.status_code}"
            print("Complete Session Response Body:", resp_complete.json())
            
            # 6. Fetch mentor details again to verify the slot is no longer in booked_slots
            resp_details3 = await client.get(details_url, headers=headers)
            booked_slots3 = resp_details3.json().get("booked_slots", [])
            print("Booked slots after completion:", booked_slots3)
            assert test_slot not in booked_slots3, f"Expected {test_slot} to NOT be in booked_slots, but got {booked_slots3}"
            print("[PASS] Completed session slot is open again.")
            
        except Exception as e:
            print("Exception occurred during integration test:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
