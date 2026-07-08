DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "yopmail.com",
    "tempmail.com",
    "temp-mail.org",
    "10minutemail.com",
    "sharklasers.com",
    "guerrillamail.com",
    "dispostable.com",
    "getairmail.com",
    "burnercmail.com",
    "trashmail.com",
    "spymail.one",
    "temporary-mail.net",
    "tempmailaddress.com",
    "maildrop.cc",
    "mailnesia.com",
}

def is_disposable_email(email: str) -> bool:
    """Check if the provided email domain is in the disposable list."""
    if not email or "@" not in email:
        return False
    domain = email.split("@")[-1].strip().lower()
    return domain in DISPOSABLE_DOMAINS
