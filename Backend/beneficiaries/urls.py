from rest_framework.routers import SimpleRouter

from .views import BeneficiaryViewSet

router = SimpleRouter()
router.register("", BeneficiaryViewSet, basename="beneficiary")

urlpatterns = router.urls