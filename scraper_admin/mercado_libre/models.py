import datetime

from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import ugettext_lazy as _

SOURCE_CHOICES = (
    ('node', _('Node')),
    ('python', _('Python')),
)

STATUS_CHOICES = (
    ('created', _('Created')),
    ('pending', _('Pending')),
    ('completed', _('Completed')),
    ('failed', _('Failed')),
)


# Create your models here.
class Execution(models.Model):
    created = models.DateTimeField(
        _('Created'), auto_now_add=datetime.datetime.now())
    modified = models.DateTimeField(
        _('Modified'), auto_now=True)
    key_word = models.CharField(
        _('Key Word'), max_length=20, default='xiaomi')
    pages = models.IntegerField(
        _('Pages'), default=5, validators=[MinValueValidator(1)])
    source = models.CharField(
        _('Source'), max_length=10, default='node', choices=SOURCE_CHOICES)
    status = models.CharField(
        _('Status'), max_length=10, default='created', choices=STATUS_CHOICES)

    def __str__(self):
        return 'Key Word: {} | Pages: {} | Source: {}'.format(
            self.key_word,
            self.pages,
            self.source
        )

    class Meta:
        verbose_name = _('Execution')
        verbose_name_plural = _('Executions')


class Item(models.Model):
    execution = models.ForeignKey(
        'mercado_libre.Execution', verbose_name=_('Execution'),
        on_delete=models.CASCADE)
    name = models.CharField(
        _('Name'), max_length=100)
    highlight = models.CharField(
        _('Highlight'), max_length=50)
    link = models.CharField(
        _('Link'), max_length=300)
    original_price = models.CharField(
        _('Original Price'), max_length=10)
    discount_price = models.CharField(
        _('Discount Price'), max_length=10)
    discount_percentage = models.CharField(
        _('Discount'), max_length=5)
    installments = models.CharField(
        _('Installments'), max_length=30)
    price_per_installment = models.CharField(
        _('Price per Installment'), max_length=10)
    store_link = models.CharField(
        _('Store Link'), max_length=300)
    store = models.CharField(
        _('Store'), max_length=50)

    class Meta:
        verbose_name = _('Item')
        verbose_name_plural = _('Items')
