from rest_framework import serializers

from .models import Beneficiary


class BeneficiarySerializer(serializers.ModelSerializer):

    class Meta:
        model = Beneficiary
        fields = [
            "id",
            "user",
            "aadhaar_no",
            "full_name",
            "address",
            "phone",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_aadhaar_no(self, value):
        if not value.isdigit() or len(value) != 12:
            raise serializers.ValidationError(
                "Aadhaar number must contain exactly 12 digits."
            )
        return value

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )
        return value

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be blank.")
        return value.strip()

    def validate(self, attrs):
        # Linking a login account is allowed for admins only
        if "user" in attrs:
            request = self.context.get("request")
            new_user = attrs["user"]
            current_user = self.instance.user if self.instance else None

            if new_user != current_user:
                if request is None or request.user.role != "ADMIN":
                    raise serializers.ValidationError(
                        {
                            "user": "Only an admin can link or unlink "
                            "a customer account."
                        }
                    )

                if new_user is not None and new_user.role != "CUSTOMER":
                    raise serializers.ValidationError(
                        {"user": "Only a Customer account can be linked."}
                    )

        return attrs