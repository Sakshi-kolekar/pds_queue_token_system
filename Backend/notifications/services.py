from .models import Notification


def notify_token_event(token, notification_type):
    """Create a notification for the beneficiary of a token."""

    token_no = token.token_no
    counter_no = token.slot.counter.counter_no

    messages = {
        Notification.Type.TOKEN_GENERATED: (
            f"Your token {token_no} has been generated."
        ),
        Notification.Type.TOKEN_CALLED: (
            f"Your token {token_no} is called. "
            f"Please come to counter {counter_no}."
        ),
        Notification.Type.TOKEN_SERVED: (
            f"Your token {token_no} has been served."
        ),
        Notification.Type.TOKEN_MISSED: (
            f"Your token {token_no} was marked as missed."
        ),
    }

    return Notification.objects.create(
        beneficiary=token.beneficiary,
        token=token,
        type=notification_type,
        message=messages[notification_type],
    )