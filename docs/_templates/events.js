{%- assign events = '' | split: '' -%}
{%- for post in site.workshops -%}
  {%- if post.time -%}
    {%- if include.category == nil or post.category == include.category -%}
      {%- assign events = events | push: post -%}
    {%- endif -%}
  {%- endif -%}
{%- endfor -%}
{%- for post in events -%}
  {% include event.js %}{% if forloop.last %}{% else %},{% endif %}
{%- endfor -%}