from rest_framework import filters, status, viewsets
from rest_framework.response import Response

from audit_logs.models import AuditLog
from users.permissions import IsAdminRole, IsStaffOrAdmin
from .models import Beneficiary
from .serializers import BeneficiarySerializer


class BeneficiaryViewSet(viewsets.ModelViewSet):
    """
    Beneficiary CRUD.
    Add / view / edit: ADMIN and STAFF. Delete: ADMIN only.
    Search: ?search=<name, aadhaar or phone>
    Filter: ?status=ACTIVE or ?status=INACTIVE
    """

    serializer_class = BeneficiarySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["full_name", "aadhaar_no", "phone"]

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminRole()]
        return [IsStaffOrAdmin()]

    def get_queryset(self):
        queryset = Beneficiary.objects.all().order_by("-created_at")

        beneficiary_status = self.request.query_params.get("status")
        if beneficiary_status:
            queryset = queryset.filter(status=beneficiary_status)

        return queryset

    def perform_create(self, serializer):
        beneficiary = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action="CREATE",
            entity_name="Beneficiary",
            entity_id=beneficiary.id,
            details={
                "full_name": beneficiary.full_name,
                "aadhaar_no": beneficiary.aadhaar_no,
            },
        )

    def perform_update(self, serializer):
        beneficiary = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action="UPDATE",
            entity_name="Beneficiary",
            entity_id=beneficiary.id,
            details={
                "full_name": beneficiary.full_name,
                "status": beneficiary.status,
            },
        )

    def destroy(self, request, *args, **kwargs):
        beneficiary = self.get_object()

        # Beneficiaries with token history must not be deleted
        if beneficiary.tokens.exists():
            return Response(
                {
                    "detail": (
                        "This beneficiary has tokens and cannot be deleted. "
                        "Set status to INACTIVE instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        entity_id = beneficiary.id
        full_name = beneficiary.full_name
        beneficiary.delete()

        AuditLog.objects.create(
            user=request.user,
            action="DELETE",
            entity_name="Beneficiary",
            entity_id=entity_id,
            details={"full_name": full_name},
        )

        return Response(status=status.HTTP_204_NO_CONTENT)