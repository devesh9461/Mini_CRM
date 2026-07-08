import datetime
from sqlalchemy.orm import Session
from app.models import Lead, Note, ActivityLog, LeadStatus, Admin
from app.auth import hash_password


def seed_database(db: Session):
    """Seed the database with default admin and dummy lead data if empty."""
    # 1. Seed Admin
    if not db.query(Admin).first():
        default_admin = Admin(
            username="admin",
            email="admin@minicrm.com",
            password=hash_password("admin123"),
        )
        db.add(default_admin)
        db.commit()
        print("[Seed] Default admin created: username=admin, password=admin123")

    # 2. Seed Leads and Notes
    if not db.query(Lead).first():
        print("[Seed] Seeding dummy leads and notes...")
        dummy_leads = [
            {
                "name": "Devesh Jangid",
                "email": "devesh@example.com",
                "phone": "+91 98765 43210",
                "source": "LinkedIn",
                "status": LeadStatus.CONTACTED,
                "notes": [
                    {
                        "content": "Had an initial call. Devesh is interested in setting up a demo for the whole sales team next Friday.",
                        "follow_up_date": datetime.date.today() + datetime.timedelta(days=2)
                    },
                    {
                        "content": "Connected on LinkedIn and shared our marketing brochures.",
                        "follow_up_date": None
                    }
                ]
            },
            {
                "name": "Sarah Miller",
                "email": "sarah.m@enterprise.com",
                "phone": "+1 555-0199",
                "source": "Website",
                "status": LeadStatus.NEW,
                "notes": [
                    {
                        "content": "Form submission from the website. Looking for pricing models for 50+ user licenses.",
                        "follow_up_date": datetime.date.today() + datetime.timedelta(days=1)
                    }
                ]
            },
            {
                "name": "Rajesh Patel",
                "email": "rajesh@innovations.in",
                "phone": "+91 99999 88888",
                "source": "Referral",
                "status": LeadStatus.CONVERTED,
                "notes": [
                    {
                        "content": "Contract signed and payment received! Onboarding scheduled for next Tuesday.",
                        "follow_up_date": None
                    },
                    {
                        "content": "Drafted formal SLA proposal and sent it over for legal review.",
                        "follow_up_date": None
                    },
                    {
                        "content": "Conducted a detailed product demo. Highly positive response, client agreed to purchase.",
                        "follow_up_date": None
                    }
                ]
            },
            {
                "name": "Emily Watson",
                "email": "emily@watsonmedia.co",
                "phone": "+44 20 7946 0958",
                "source": "Google Ads",
                "status": LeadStatus.LOST,
                "notes": [
                    {
                        "content": "Budget constraint. Our pricing was too expensive for their startup stage. Marking as lost for now.",
                        "follow_up_date": None
                    },
                    {
                        "content": "Follow-up email sent regarding pricing plans.",
                        "follow_up_date": None
                    }
                ]
            },
            {
                "name": "Vikram Singh",
                "email": "vikram@singhtech.com",
                "phone": "+91 91111 22222",
                "source": "Email Campaign",
                "status": LeadStatus.NEW,
                "notes": []
            },
            {
                "name": "Amanda Ross",
                "email": "amanda.ross@gmail.com",
                "phone": "+1 415-555-2671",
                "source": "Other",
                "status": LeadStatus.CONTACTED,
                "notes": [
                    {
                        "content": "Sent introductory email. Client replied and wants to schedule a short 15-minute call.",
                        "follow_up_date": datetime.date.today() + datetime.timedelta(days=3)
                    }
                ]
            }
        ]

        for ld in dummy_leads:
            lead = Lead(
                name=ld["name"],
                email=ld["email"],
                phone=ld["phone"],
                source=ld["source"],
                status=ld["status"]
            )
            db.add(lead)
            db.flush()  # to get lead.id

            # Create Activity Log for Lead Creation
            db.add(ActivityLog(
                lead_id=lead.id,
                action="lead_created",
                details=f"Lead '{lead.name}' created via {lead.source}"
            ))

            for nd in ld["notes"]:
                note = Note(
                    lead_id=lead.id,
                    content=nd["content"],
                    follow_up_date=nd["follow_up_date"]
                )
                db.add(note)
                
                # Create Activity Log for note creation
                db.add(ActivityLog(
                    lead_id=lead.id,
                    action="note_added",
                    details=f"Added note: '{note.content[:30]}...'"
                ))

        db.commit()
        print("[Seed] Seed data successfully committed.")
