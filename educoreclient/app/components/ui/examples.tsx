/**
 * UI Components Usage Examples
 * 
 * This file demonstrates how to use the comprehensive UI component library
 * created for the AcademiaSuite enterprise application.
 */

// Import all components from the UI library
import {
  Button, Input, Select, Textarea, Checkbox, RadioGroup,
  Card, Table, Alert, Badge, Pagination,
  StatsCard, StatusBadge, Dropdown, Loader, Progress,
  useToast, type SelectOption, type DropdownItem
} from '@/app/components/ui';
import { Users, DollarSign } from 'lucide-react';

// Example usage patterns:

// 1. Form Components
const FormExample = () => {
  const selectOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  const radioOptions = [
    { value: 'active', label: 'Active', description: 'Item is active' },
    { value: 'inactive', label: 'Inactive', description: 'Item is inactive' },
  ];

  return (
    <Card>
      <Card.Header>
        <h2>Form Example</h2>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <Input label="Name" placeholder="Enter name" />
          <Select label="Category" options={selectOptions} value="" onChange={() => {}} />
          <Textarea label="Description" value="" onChange={() => {}} />
          <Checkbox label="Active" checked={false} onChange={() => {}} />
          <RadioGroup label="Status" options={radioOptions} value="" onChange={() => {}} />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button variant="primary">Submit</Button>
      </Card.Footer>
    </Card>
  );
};

// 2. Data Display with Table
const TableExample = () => (
  <Card>
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Cell header>Name</Table.Cell>
          <Table.Cell header>Status</Table.Cell>
          <Table.Cell header>Actions</Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>John Doe</Table.Cell>
          <Table.Cell><StatusBadge isActive={true} /></Table.Cell>
          <Table.Cell>
            <Button size="sm" variant="outline">Edit</Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </Card>
);

// 3. Stats Dashboard
const StatsExample = () => (
  <div className="grid grid-cols-4 gap-4">
    <StatsCard
      title="Total Users"
      value={1234}
      subtitle="Active users"
      icon={Users}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-50"
    />
    <StatsCard
      title="Revenue"
      value="$12,345"
      subtitle="This month"
      icon={DollarSign}
      iconColor="text-green-600"
      iconBgColor="bg-green-50"
    />
  </div>
);

// 4. Toast Notifications Usage
const ToastExample = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return (
    <div className="space-x-2">
      <Button onClick={() => showSuccess('Success!', 'Operation completed')}>
        Success Toast
      </Button>
      <Button onClick={() => showError('Error!', 'Something went wrong')}>
        Error Toast
      </Button>
      <Button onClick={() => showWarning('Warning!', 'Please check this')}>
        Warning Toast
      </Button>
      <Button onClick={() => showInfo('Info', 'Here is some information')}>
        Info Toast
      </Button>
    </div>
  );
};

// 5. Advanced Components
const AdvancedExample = () => {
  const dropdownItems: DropdownItem[] = [
    { id: '1', label: 'Edit', onClick: () => console.log('Edit') },
    { id: '2', label: 'Delete', onClick: () => console.log('Delete') },
    { id: '3', separator: true },
    { id: '4', label: 'Archive', onClick: () => console.log('Archive') },
  ];

  return (
    <div className="space-y-4">
      <Alert variant="info">
        <strong>Information:</strong> This is an informational alert.
      </Alert>
      
      <div className="flex items-center space-x-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error" removable onRemove={() => {}}>
          Error
        </Badge>
      </div>
      
      <Progress value={75} showLabel label="Upload Progress" />
      
      <Loader size="md" variant="spinner" />
      
      <Dropdown
        trigger={<Button>Actions</Button>}
        items={dropdownItems}
      />
      
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={() => {}}
        totalItems={100}
        itemsPerPage={10}
      />
    </div>
  );
};

export {
  FormExample,
  TableExample,
  StatsExample,
  ToastExample,
  AdvancedExample,
};
