insert into public.food_categories (name, sort_order) values
  ('Swallows', 10),
  ('Soups', 20),
  ('Rice Meals', 30),
  ('Beans Meals', 40),
  ('Yam Meals', 50),
  ('Protein-rich Meals', 60),
  ('Light Meals', 70),
  ('Stews', 80),
  ('Others', 90)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.feedback_options (label, sort_order) values
  ('Strongly agree', 10),
  ('Agree', 20),
  ('Not sure', 30),
  ('Disagree', 40),
  ('Strongly disagree', 50)
on conflict (label) do update set sort_order = excluded.sort_order;

insert into public.feedback_questions (id, text, sort_order) values
  ('easy_use', 'The app was easy to use.', 10),
  ('understood_result', 'I understood the food result.', 20),
  ('useful_advice', 'The nutrition advice was useful.', 30),
  ('understood_meal', 'The app helped me understand my meal better.', 40),
  ('use_again', 'I would use this app again.', 50),
  ('fast_result', 'The result appeared quickly.', 60)
on conflict (id) do update set text = excluded.text, sort_order = excluded.sort_order;

insert into public.quick_questions (id, text, sort_order) values
  ('balance_swallow', 'How can I balance a swallow meal?', 10),
  ('high_protein', 'What can I eat for more protein?', 20),
  ('late_night', 'What should I eat late at night?', 30),
  ('diabetes', 'How do I reduce excess carbs?', 40)
on conflict (id) do update set text = excluded.text, sort_order = excluded.sort_order;

insert into public.learn_sections (title, description, icon_name, tip_count) values
  ('Portion basics', 'Learn how local portions affect calories and macros.', 'Scale', 4),
  ('Balanced plates', 'Build better African meals with protein, fibre, and vegetables.', 'Utensils', 4),
  ('Health awareness', 'Understand practical choices for wellness goals.', 'Heart', 4);

insert into public.nutrition_tips (title, content, category, icon_name) values
  ('Add protein to heavy carb meals', 'Pair rice, yam, or swallow with egg, fish, beans, chicken, or lean meat.', 'Balanced plates', 'Leaf'),
  ('Watch portion size', 'A smaller swallow portion can reduce calories while keeping the soup satisfying.', 'Portion basics', 'Scale'),
  ('Choose fibre often', 'Beans, vegetables, and some soups can help meals feel fuller for longer.', 'Health awareness', 'Wheat');

insert into public.meal_suggestions (name, description, category, icon_name) values
  ('Beans porridge with fish', 'A filling option with protein, fibre, and steady energy.', 'Beans Meals', 'Bean'),
  ('Jollof rice with chicken and vegetables', 'Keeps the familiar meal but improves protein and micronutrients.', 'Rice Meals', 'Utensils'),
  ('Okra soup with moderate swallow', 'A lighter soup-forward plate with controlled carbs.', 'Swallows', 'Soup');

insert into public.research_metrics (label, value, note, sort_order) values
  ('Recognition Accuracy', 'Pending', 'Use measured validation results from the deployed model.', 10),
  ('Average Inference Speed', 'Pending', 'Measure from real scan requests across target devices.', 20),
  ('Usefulness Rating', 'Pending', 'Populate from submitted study feedback.', 30),
  ('Ease of Use Rating', 'Pending', 'Populate from submitted study feedback.', 40);
