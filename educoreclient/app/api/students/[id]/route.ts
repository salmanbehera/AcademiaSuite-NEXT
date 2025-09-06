import { NextRequest, NextResponse } from 'next/server';
import { StudentFormData } from '@/types/api-types';

/**
 * Clean API Routes for Individual Student Operations
 * Replace the TODO comments with your actual database operations
 */

/**
 * GET /api/students/[id]
 * Fetch a single student by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _id } = await params;

    // TODO: Replace with actual database query
    // Example with Prisma:
    /*
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    */

    return NextResponse.json({
      success: true,
      data: null, // Replace with actual student data
      message: 'Student fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/students/[id]
 * Update a single student
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _id } = await params;
    // const studentData: Partial<StudentFormData> = await request.json();

    // TODO: Add validation
    // TODO: Check if student exists
    // TODO: Update student in database

    // Example with Prisma:
    /*
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...studentData,
        updatedBy: currentUserId,
        updatedAt: new Date(),
      }
    });
    */

    return NextResponse.json({
      success: true,
      data: null, // Replace with actual updated student
      message: 'Student updated successfully',
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update student' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Delete a single student
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _id } = await params;

    // TODO: Check if student exists
    // TODO: Check for dependencies (enrollments, etc.)
    // TODO: Soft delete or hard delete based on business rules

    // Example with Prisma (soft delete):
    /*
    const deletedStudent = await prisma.student.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updatedBy: currentUserId,
        updatedAt: new Date(),
      }
    });
    */

    // Example with Prisma (hard delete):
    /*
    await prisma.student.delete({
      where: { id }
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
