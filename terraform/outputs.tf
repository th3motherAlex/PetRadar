output "resource_group_name" {
  description = "Name of the Azure Resource Group."
  value       = azurerm_resource_group.incident.name
}

output "public_ip_address" {
  description = "Public IP address assigned to the VM."
  value       = azurerm_public_ip.incident.ip_address
}

output "ssh_command" {
  description = "SSH command for connecting to the VM."
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.incident.ip_address}"
}
