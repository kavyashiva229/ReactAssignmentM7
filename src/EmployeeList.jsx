import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import EmployeeFilter from './EmployeeFilter.jsx'
import { Badge, Button, Table, Card, Modal } from 'react-bootstrap'
import EmployeeAdd from './EmployeeAdd.jsx'


function EmployeeTable(props) {
    const { search } = useLocation()
    const query = new URLSearchParams(search)
    const q = query.get('employed')

    const employeeRows = props.employees
        .filter(employee =>
            q ? String(employee.currentlyEmployed) === q : true
        )
        .map(employee => (
            <EmployeeRow
                key={employee._id}
                employee={employee}
                deleteEmployee={props.deleteEmployee}
            />
        ))

    return (
        <Card>
            <Card.Header as="h5">
                All Employees <Badge bg="secondary">{employeeRows.length}</Badge>
            </Card.Header>
            <Card.Body>
                <Table striped size="sm">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Name</th>
                            <th>Extension</th>
                            <th>Email</th>
                            <th>Title</th>
                            <th>Date Hired</th>
                            <th>Currently Employed?</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{employeeRows}</tbody>
                </Table>
            </Card.Body>
        </Card>
    )
}


class EmployeeRow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false
        }
        this.toggleModal = this.toggleModal.bind(this)
        this.confirmDelete = this.confirmDelete.bind(this)
    }

    toggleModal() {
        this.setState({
            modalVisible: !this.state.modalVisible
        })
    }

    confirmDelete() {
        this.props.deleteEmployee(this.props.employee._id)
        this.toggleModal()
    }

    render() {
        const { employee } = this.props

        return (
            <tr>
                <td></td>
                <td>
                    <Link to={`/edit/${employee._id}`}>
                        {employee.name}
                    </Link>
                </td>
                <td>{employee.extension}</td>
                <td>{employee.email}</td>
                <td>{employee.title}</td>
                <td>{employee.dateHired.toDateString()}</td>
                <td>{employee.currentlyEmployed ? 'Yes' : 'No'}</td>
                <td>
                 
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={this.toggleModal}
                    >
                        DELETE
                    </Button>

                  
                    <Modal
                        show={this.state.modalVisible}
                        onHide={this.toggleModal}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Delete</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete this employee?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={this.toggleModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={this.confirmDelete}
                            >
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </td>
            </tr>
        )
    }
}


export default class EmployeeList extends React.Component {
    constructor() {
        super()
        this.state = { employees: [] }
        this.createEmployee = this.createEmployee.bind(this)
        this.deleteEmployee = this.deleteEmployee.bind(this)
    }

    componentDidMount() {
        this.loadData()
    }

    loadData() {
        fetch('/api/employees')
            .then(response => response.json())
            .then(data => {
                data.employees.forEach(employee => {
                    employee.dateHired = new Date(employee.dateHired)
                })
                this.setState({ employees: data.employees })
            })
            .catch(err => console.log(err))
    }

    createEmployee(employee) {
        fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
        })
            .then(response => response.json())
            .then(newEmployee => {
                newEmployee.employee.dateHired = new Date(
                    newEmployee.employee.dateHired
                )
                const newEmployees = this.state.employees.concat(
                    newEmployee.employee
                )
                this.setState({ employees: newEmployees })
            })
            .catch(err => console.log(err))
    }

    deleteEmployee(id) {
        fetch(`/api/employees/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    this.loadData()
                } else {
                    console.log('Failed to delete employee')
                }
            })
    }

    render() {
        return (
            <React.Fragment>
                <EmployeeAdd createEmployee={this.createEmployee} />
                <EmployeeFilter />
                <EmployeeTable
                    employees={this.state.employees}
                    deleteEmployee={this.deleteEmployee}
                />
            </React.Fragment>
        )
    }
}
