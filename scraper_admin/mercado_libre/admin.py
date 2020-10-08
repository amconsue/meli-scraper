import requests

from django.conf import settings
from django.conf.urls import url
from django.contrib import admin
from django.contrib import messages
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _

from .models import Execution
from .models import Item


class ExecutionModelAdmin(admin.ModelAdmin):
    list_display = [
        'created',
        'modified',
        'key_word',
        'pages',
        'source',
        'status',
        '_items'
    ]
    exclude = [
        'status'
    ]
    actions = [
        'activate_scraping',
        'run_analysis'
    ]

    def _items(self, obj):
        if obj.status == 'completed':
            changelist_url = reverse('admin:mercado_libre_item_changelist')
            changelist_url = '{}?q={}'.format(changelist_url, obj.id)
            return mark_safe('<a href={}>{}</a>'.format(
                changelist_url, _('View Items')))
        else:
            return '-'
    _items.short_description = _('Items')

    def activate_scraping(self, request, queryset):
        if queryset.count() > 1:
            message = _(
                'Only one execution can be sent for scraping at a time')
            return self.message_user(request, message, level=messages.ERROR)

        execution = queryset.first()

        if execution.status != 'created':
            message = _('Only executions in status \'Created\' can be '
                        'activated for scraping')
            return self.message_user(request, message, level=messages.ERROR)

        scraping_json = {
            'callbackUrl': 'http://{}:{}{}{}/'.format(
                settings.SCRAPER_ADMIN_HOST,
                settings.SCRAPER_ADMIN_PORT,
                '/mercado_libre/v1/status/',
                execution.id
            ),
            'keyWord': execution.key_word,
            'pages': execution.pages
        }

        if execution.source == 'node':
            scraping_url = 'http://{}:{}{}'.format(
                settings.NODE_SCRAPER_HOST,
                settings.NODE_SCRAPER_PORT,
                settings.NODE_SCRAPER_API
            )
        elif execution.source == 'python':
            message = _('Python scraping funtionality is not yet implemented')
            return self.message_user(request, message, level=messages.ERROR)

        scraping_response = requests.post(scraping_url, json=scraping_json)

        if scraping_response.status_code != 200:
            execution.status = 'failed'
            execution.save()
            message = _('Error making request to scraper')
            return self.message_user(request, message, level=messages.ERROR)

        execution.status = 'pending'
        execution.save()

        message = _('Scraping process has been started')
        return self.message_user(request, message, level=messages.SUCCESS)
    activate_scraping.short_description = _('Activate Scraping')

    def run_analysis(self, request, queryset):
        if queryset.count() > 1:
            message = _(
                'Only one execution can be sent for analysis at a time')
            return self.message_user(request, message, level=messages.ERROR)

        execution = queryset.first()
        if execution.status != 'completed':
            message = _('Only executions in status \'Completed\' can be '
                        'activated for analysis')
            return self.message_user(request, message, level=messages.ERROR)

        items = Item.objects.filter(execution=execution)

        if not items.exists():
            message = _('No items were found in this execution')
            return self.message_user(request, message, level=messages.ERROR)

        return self.run_analysis_confirmation(request, execution)
    run_analysis.short_description = _('Run Analysis')

    def run_analysis_confirmation(self, request, execution=None):
        self.request = request

        if execution:
            context = dict(
                # Include common variables for rendering the admin template.
                self.admin_site.each_context(request),
                execution=execution
            )

            return TemplateResponse(
                request,
                'run_analysis_confirmation.html',
                context
            )

        if request.POST \
                and request.POST.get('action') == 'run_analysis_confirmation':
            execution_id = request.POST.get('execution_id', None)
            comparison_field = request.POST.get('comparison_field', None)

            execution = Execution.objects.get(id=execution_id)

            data_list = []
            product_counter = 0
            items = Item.objects.filter(execution=execution)
            item_counter = items.count()

            for item in items:
                object_to_compare = getattr(item, comparison_field)
                if object_to_compare not in data_list:
                    data_list.append(object_to_compare)
                    product_counter += 1

            context = dict(
                # Include common variables for rendering the admin template.
                self.admin_site.each_context(request),
                execution=execution,
                product_counter=product_counter,
                item_counter=item_counter,
                comparison_field=comparison_field.replace('_', ' ').title()
            )

            return TemplateResponse(
                request,
                'run_analysis_results.html',
                context
            )

    def get_urls(self):
        urls = super(ExecutionModelAdmin, self).get_urls()

        my_urls = [
            url(
                r'^run_analysis_confirmation/$',
                self.run_analysis_confirmation
            )
        ]

        return my_urls + urls

    def has_delete_permission(self, request, obj=None):
        return False


class ItemModelAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'highlight',
        '_link',
        'original_price',
        'discount_price',
        'discount_percentage',
        'installments',
        'price_per_installment',
        '_store_link',
        'store',
    ]
    readonly_fields = [
        'execution'
    ]
    search_fields = ['=execution__id']
    actions = None

    def _link(self, obj):
        return mark_safe('<a href={} target="_blank">{}</a>'.format(
            obj.link, _('Go to Item in MercadoLibre')))
    _link.short_description = _('Link')

    def _store_link(self, obj):
        if obj.store_link:
            return mark_safe('<a href={} target="_blank">{}</a>'.format(
                obj.store_link, _('Go to Store in MercadoLibre')))
        else:
            return '-'
    _link.short_description = _('Store Link')


admin.site.register(Execution, ExecutionModelAdmin)
admin.site.register(Item, ItemModelAdmin)
