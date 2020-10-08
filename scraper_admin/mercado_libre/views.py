import json

from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View

from .models import Execution
from .models import Item


@method_decorator(csrf_exempt, name='dispatch')
class PostItemsView(View):
    def post(self, request, *args, **kwargs):
        try:
            request_body = json.loads(request.body)
        except Exception as exp:
            response_data_content = {
                'message': 'Unable to parse request body: {}'.format(exp),
            }
            response_data = {
                'content': json.dumps(response_data_content),
                'status': 500
            }

            return HttpResponse(**response_data)

        execution_id = self.kwargs.get('execution_id', None)
        execution = Execution.objects.get(pk=execution_id)

        if request.GET.get('error', None):
            execution.status = 'failed'
            execution.save()

            response_data_content = {
                'message': 'Execution set to status \'failed\' successfully',
            }
            response_data = {
                'content': json.dumps(response_data_content),
                'status': 200
            }

            return HttpResponse(**response_data)

        if not isinstance(request_body, list):
            response_data_content = {
                'message': 'POST json must be a list containing the items',
            }
            response_data = {
                'content': json.dumps(response_data_content),
                'status': 500
            }

            return HttpResponse(**response_data)

        items = []
        keys = [
            'name',
            'highlight',
            'link',
            'original_price',
            'discount_price',
            'discount_percentage',
            'installments',
            'price_per_installment',
            'store_link',
            'store'
        ]

        for item in request_body:
            new_item = {'execution_id': execution_id}
            for key in keys:
                try:
                    new_item[key] = item[key]
                except KeyError:
                    pass
            items.append(new_item)

        Item.objects.bulk_create([Item(**item) for item in items])

        execution.status = 'completed'
        execution.save()

        response_data_content = {
            'message': 'Items created successfully',
        }
        response_data = {
            'content': json.dumps(response_data_content),
            'status': 200
        }

        return HttpResponse(**response_data)


@method_decorator(csrf_exempt, name='dispatch')
class UpdateExecutionStatus(View):
    def patch(self, request, *args, **kwargs):
        pass
