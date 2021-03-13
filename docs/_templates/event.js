{%- for time in post.time -%}
{
  title  : '{{ post.title }}{% unless forloop.first %} (continued){% endunless %}',
  url    : "{{ post.url | relative_url }}",
  allDay : {% if post.all_day %}true{% else %}false{% endif %},
  category : "{{ post.category }}",
  {% unless time.end %}// {% endunless %}end    : '{{ time.end | date_to_xmlschema }}',
  start  : '{{ time.start | date_to_xmlschema }}'
}{% unless forloop.last %},{% endunless %}
{%- endfor -%}