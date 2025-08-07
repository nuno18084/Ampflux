import re
from typing import Optional
from datetime import datetime

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    return True

def validate_name(name: str) -> bool:
    """Validate name format"""
    if len(name.strip()) < 2:
        return False
    return True

def validate_project_name(name: str) -> bool:
    """Validate project name"""
    if len(name.strip()) < 3:
        return False
    return True

def validate_company_name(name: str) -> bool:
    """Validate company name"""
    if len(name.strip()) < 2:
        return False
    return True

def validate_circuit_data(data: dict) -> bool:
    """Validate circuit data structure"""
    if not isinstance(data, dict):
        return False
    
    if 'components' not in data or 'connections' not in data:
        return False
    
    if not isinstance(data['components'], list) or not isinstance(data['connections'], list):
        return False
    
    return True

def validate_component_type(component_type: str) -> bool:
    """Validate component type"""
    valid_types = [
        "battery", "solar_panel", "generator", "capacitor", "inductor",
        "switch", "relay", "transistor", "diode", "resistor",
        "temperature_sensor", "pressure_sensor", "flow_sensor"
    ]
    return component_type in valid_types

def validate_user_role(role: str) -> bool:
    """Validate user role"""
    valid_roles = ["user", "company_admin"]
    return role in valid_roles

def validate_project_role(role: str) -> bool:
    """Validate project role"""
    valid_roles = ["viewer", "editor", "owner"]
    return role in valid_roles

def validate_share_status(status: str) -> bool:
    """Validate share status"""
    valid_statuses = ["pending", "accepted", "rejected"]
    return status in valid_statuses

def validate_version_number(version: int) -> bool:
    """Validate version number"""
    return isinstance(version, int) and version > 0

def validate_date_format(date_string: str) -> bool:
    """Validate date format"""
    try:
        datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False

def sanitize_string(input_string: str) -> str:
    """Sanitize string input"""
    if not input_string:
        return ""
    return input_string.strip()

def validate_json_string(json_string: str) -> bool:
    """Validate JSON string"""
    try:
        import json
        json.loads(json_string)
        return True
    except (json.JSONDecodeError, TypeError):
        return False

def validate_uuid(uuid_string: str) -> bool:
    """Validate UUID format"""
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(pattern, uuid_string.lower()))

def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """Validate file extension"""
    if not filename:
        return False
    file_extension = filename.lower().split('.')[-1]
    return file_extension in allowed_extensions

def validate_file_size(file_size: int, max_size_mb: int) -> bool:
    """Validate file size"""
    max_size_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_size_bytes 