from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from beneficiaries.models import Beneficiary
from counters.models import Counter
from tokens.models import Token
from users.permissions import IsAdminRole, IsStaffOrAdmin


def status_counts(queryset):
    """Count tokens of each status in the given queryset."""
    return {
        "total": queryset.count(),
        "waiting": queryset.filter(status=Token.Status.WAITING).count(),
        "serving": queryset.filter(status=Token.Status.CALLED).count(),
        "served": queryset.filter(status=Token.Status.SERVED).count(),
        "missed": queryset.filter(status=Token.Status.MISSED).count(),
        "cancelled": queryset.filter(status=Token.Status.CANCELLED).count(),
    }


class DashboardAPIView(APIView):
    """Today's summary for the dashboard."""

    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        today = timezone.localdate()
        todays_tokens = Token.objects.filter(token_date=today)

        counters = []
        for counter in Counter.objects.select_related("operator"):
            counter_tokens = todays_tokens.filter(slot__counter=counter)

            current = counter_tokens.filter(
                status=Token.Status.CALLED
            ).order_by("-called_at").first()

            counters.append(
                {
                    "id": counter.id,
                    "counter_no": counter.counter_no,
                    "name": counter.name,
                    "status": counter.status,
                    "operator": (
                        counter.operator.username if counter.operator else None
                    ),
                    "current_token": current.token_no if current else None,
                    "tokens_today": status_counts(counter_tokens),
                }
            )

        return Response(
            {
                "date": str(today),
                "total_beneficiaries": Beneficiary.objects.count(),
                "tokens_today": status_counts(todays_tokens),
                "counters": counters,
            },
            status=status.HTTP_200_OK,
        )


class TokenReportAPIView(APIView):
    """
    Token report calculated from the token data.
    Filters: ?date_from=YYYY-MM-DD &date_to=YYYY-MM-DD
             &status=SERVED &counter=<counter id>
    """

    permission_classes = [IsAdminRole]

    def get(self, request):
        tokens = Token.objects.all()

        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        token_status = request.query_params.get("status")
        counter_id = request.query_params.get("counter")

        if date_from:
            parsed = parse_date(date_from)
            if parsed is None:
                return Response(
                    {"detail": "Invalid date_from. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tokens = tokens.filter(token_date__gte=parsed)

        if date_to:
            parsed = parse_date(date_to)
            if parsed is None:
                return Response(
                    {"detail": "Invalid date_to. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tokens = tokens.filter(token_date__lte=parsed)

        if token_status:
            tokens = tokens.filter(status=token_status)

        if counter_id:
            tokens = tokens.filter(slot__counter_id=counter_id)

        by_counter = (
            tokens.values("slot__counter__counter_no")
            .annotate(
                total=Count("id"),
                served=Count("id", filter=Q(status=Token.Status.SERVED)),
                missed=Count("id", filter=Q(status=Token.Status.MISSED)),
            )
            .order_by("slot__counter__counter_no")
        )

        by_date = (
            tokens.values("token_date")
            .annotate(
                total=Count("id"),
                served=Count("id", filter=Q(status=Token.Status.SERVED)),
                missed=Count("id", filter=Q(status=Token.Status.MISSED)),
            )
            .order_by("token_date")
        )

        return Response(
            {
                "filters": {
                    "date_from": date_from,
                    "date_to": date_to,
                    "status": token_status,
                    "counter": counter_id,
                },
                "summary": status_counts(tokens),
                "by_counter": [
                    {
                        "counter_no": row["slot__counter__counter_no"],
                        "total": row["total"],
                        "served": row["served"],
                        "missed": row["missed"],
                    }
                    for row in by_counter
                ],
                "by_date": [
                    {
                        "date": str(row["token_date"]),
                        "total": row["total"],
                        "served": row["served"],
                        "missed": row["missed"],
                    }
                    for row in by_date
                ],
            },
            status=status.HTTP_200_OK,
        )