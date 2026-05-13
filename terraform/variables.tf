variable "ENVIRONMENT" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "LOCATION" {
  description = "Azure region where resources will be created."
  type        = string
  default     = "westus2"
}

variable "admin_username" {
  description = "Admin username for the Linux VM."
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key used to access the VM."
  type        = string
  default     = "../keys/incident_key.pub"
}

variable "vm_size" {
  description = "Azure VM size."
  type        = string
  default     = "Standard_B2s"
}
