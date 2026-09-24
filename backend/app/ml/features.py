from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import numpy as np

TASK_TYPES = ['Earth Excavation', 'Trenching', 'Material Loading', 'Grading', 'Demolition']
WEATHERS = ['Sunny', 'Cloudy', 'Rainy', 'Windy']
SKILLS = ['Beginner', 'Intermediate', 'Expert']
SKILL_ORD = {s: i for i, s in enumerate(SKILLS)}

BASELINE_ESTIMATES = {
    'Earth Excavation': 60,
    'Trenching': 45,
    'Material Loading': 30,
    'Grading': 35,
    'Demolition': 90,
}

def get_feature_columns():
    return ['task_type', 'weather', 'operator_skill', 'machine_age_yrs']

def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ('task', OneHotEncoder(categories=[TASK_TYPES], sparse_output=False, handle_unknown='error'), ['task_type']),
            ('weather', OneHotEncoder(categories=[WEATHERS], sparse_output=False, handle_unknown='error'), ['weather']),
            ('skill', OrdinalEncoder(categories=[SKILLS]), ['operator_skill']),
            ('age', 'passthrough', ['machine_age_yrs']),
        ],
        remainder='drop'
    )
