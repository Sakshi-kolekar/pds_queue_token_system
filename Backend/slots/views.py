from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from users.permissions import IsAdminOrReadOnly
from .models import Slot
from .serializers import SlotSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
def slot_list_create(request):

    if request.method == "GET":
        slots = Slot.objects.select_related("counter").all().order_by(
            "slot_date", "start_time"
        )
        serializer = SlotSerializer(slots, many=True)
        return Response(serializer.data)

    serializer = SlotSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAdminOrReadOnly])
def slot_detail(request, pk):

    try:
        slot = Slot.objects.select_related("counter").get(pk=pk)
    except Slot.DoesNotExist:
        return Response(
            {"detail": "Slot not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = SlotSerializer(slot)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = SlotSerializer(slot, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == "DELETE":
        if slot.tokens.exists():
            return Response(
                {"detail": "Slot has tokens and cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)