"""
Seed script — populates the database with demo data.

Usage:
    cd backend
    python -m app.seed
"""
from datetime import datetime, timedelta
import random
from app.database import SessionLocal, engine, Base
from app.models import Admin, Lead, LeadStatus, Note
from app.auth import hash_password


def seed():
    """Populate database with sample admin, leads, and notes."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Check if already seeded ───────────────────────────────────────
        if db.query(Admin).first():
            print("⚠️  Database already has data. Skipping seed.")
            return

        # ── Create default admin ──────────────────────────────────────────
        admin = Admin(
            username="admin",
            email="admin@minicrm.com",
            password=hash_password("admin123"),
        )
        db.add(admin)
        print("✅ Created admin: username=admin, password=admin123")

        # ── Create sample leads ───────────────────────────────────────────
        sample_leads = [
            {"name": "Rahul Sharma", "email": "rahul.sharma@gmail.com", "phone": "+91-9876543210", "source": "Website", "status": LeadStatus.NEW},
            {"name": "Priya Patel", "email": "priya.patel@outlook.com", "phone": "+91-8765432109", "source": "LinkedIn", "status": LeadStatus.CONTACTED},
            {"name": "Amit Kumar", "email": "amit.kumar@yahoo.com", "phone": "+91-7654321098", "source": "Referral", "status": LeadStatus.CONVERTED},
            {"name": "Sneha Reddy", "email": "sneha.r@gmail.com", "phone": "+91-6543210987", "source": "Website", "status": LeadStatus.NEW},
            {"name": "Vikram Singh", "email": "vikram.singh@company.com", "phone": "+91-5432109876", "source": "Google Ads", "status": LeadStatus.CONTACTED},
            {"name": "Ananya Iyer", "email": "ananya.i@techcorp.com", "phone": "+91-4321098765", "source": "Website", "status": LeadStatus.NEW},
            {"name": "Rohan Gupta", "email": "rohan.g@startup.io", "phone": "+91-3210987654", "source": "Referral", "status": LeadStatus.CONVERTED},
            {"name": "Kavitha Nair", "email": "kavitha.nair@gmail.com", "phone": "+91-2109876543", "source": "LinkedIn", "status": LeadStatus.LOST},
            {"name": "Arjun Mehta", "email": "arjun.m@enterprise.com", "phone": "+91-1098765432", "source": "Website", "status": LeadStatus.CONTACTED},
            {"name": "Divya Joshi", "email": "divya.joshi@mail.com", "phone": "+91-9988776655", "source": "Google Ads", "status": LeadStatus.NEW},
            {"name": "Suresh Babu", "email": "suresh.b@consulting.in", "phone": "+91-8877665544", "source": "Referral", "status": LeadStatus.CONTACTED},
            {"name": "Meera Krishnan", "email": "meera.k@design.co", "phone": "+91-7766554433", "source": "Website", "status": LeadStatus.NEW},
        ]

        leads = []
        for i, data in enumerate(sample_leads):
            lead = Lead(**data)
            # Spread created_at over the last 30 days
            lead.created_at = datetime.now() - timedelta(days=30 - i * 2, hours=random.randint(0, 23))
            db.add(lead)
            leads.append(lead)

        db.flush()  # Get IDs assigned
        print(f"✅ Created {len(leads)} sample leads")

        # ── Create sample notes ───────────────────────────────────────────
        sample_notes = [
            {"content": "Initial contact made via email. Client is interested in our web development services.", "days_ago": 5},
            {"content": "Follow-up call scheduled. Client wants a detailed proposal for their e-commerce platform.", "days_ago": 3, "follow_up_days": 2},
            {"content": "Sent pricing proposal. Awaiting client response.", "days_ago": 2},
            {"content": "Client confirmed the project. Moving to onboarding.", "days_ago": 1},
            {"content": "Discussed project requirements in detail. Client needs a CRM integration.", "days_ago": 4, "follow_up_days": 3},
            {"content": "Shared portfolio and case studies. Client was impressed with the fintech project.", "days_ago": 6},
            {"content": "Client requested a demo of our SaaS product. Scheduling for next week.", "days_ago": 2, "follow_up_days": 5},
            {"content": "No response after 3 follow-ups. Marking as cold lead.", "days_ago": 1},
        ]

        for i, lead in enumerate(leads[:8]):
            note_data = sample_notes[i]
            note = Note(
                lead_id=lead.id,
                content=note_data["content"],
                created_at=datetime.now() - timedelta(days=note_data["days_ago"]),
                follow_up_date=(
                    (datetime.now() + timedelta(days=note_data["follow_up_days"])).date()
                    if "follow_up_days" in note_data
                    else None
                ),
            )
            db.add(note)

        print(f"✅ Created {len(sample_notes)} sample notes")

        db.commit()
        print("\n🎉 Database seeded successfully!")
        print("   Login with: username=admin, password=admin123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
