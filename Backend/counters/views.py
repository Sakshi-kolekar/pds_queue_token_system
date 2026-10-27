from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from users.permissions import IsAdminOrReadOnly
from .models import Counter
from .serializers import CounterSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
def counter_list_create(request):

    if request.method == "GET":
        counters = Counter.objects.select_related("operator").all()
        serializer = CounterSerializer(counters, many=True)
        return Response(serializer.data)

    serializer = CounterSerializer(data=request.data)

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
def counter_detail(request, pk):

    try:
        counter = Counter.objects.select_related("operator").get(pk=pk)
    except Counter.DoesNotExist:
        return Response(
            {"detail": "Counter not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = CounterSerializer(counter)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = CounterSerializer(counter, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == "DELETE":
        if counter.slots.exists():
            return Response(
                {"detail": "Counter has slots and cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        counter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)