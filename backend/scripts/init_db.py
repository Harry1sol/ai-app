"""Initialize database and seed with sample data."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import init_db, get_db_context
from database.models import Exam, Subject, Chapter

def main():
    """Initialize database and seed data."""
    print("🔧 Initializing database...")
    init_db()
    print("✅ Database initialized!")

    print("\n🌱 Seeding sample data...")

    with get_db_context() as db:
        # Check if data already exists
        existing = db.query(Exam).count()
        if existing > 0:
            print("⚠️  Data already exists. Skipping seed.")
            return

        # Create exams
        upsc = Exam(
            name='UPSC',
            full_name='Union Public Service Commission',
            category='competitive',
            description='Civil Services Examination'
        )

        cbse = Exam(
            name='CBSE',
            full_name='Central Board of Secondary Education',
            category='board',
            description='Class 10 and Class 12 Board Exams'
        )

        jee = Exam(
            name='JEE_MAIN',
            full_name='JEE Main',
            category='competitive',
            description='Joint Entrance Examination - Main'
        )

        db.add_all([upsc, cbse, jee])
        db.flush()

        # Create subjects for CBSE
        cbse_subjects = [
            Subject(exam_id=cbse.id, name='Mathematics', code='MATH'),
            Subject(exam_id=cbse.id, name='Physics', code='PHY'),
            Subject(exam_id=cbse.id, name='Chemistry', code='CHEM'),
            Subject(exam_id=cbse.id, name='Biology', code='BIO'),
            Subject(exam_id=cbse.id, name='English', code='ENG'),
        ]

        # Create subjects for JEE
        jee_subjects = [
            Subject(exam_id=jee.id, name='Physics', code='PHY'),
            Subject(exam_id=jee.id, name='Chemistry', code='CHEM'),
            Subject(exam_id=jee.id, name='Mathematics', code='MATH'),
        ]

        # Create subjects for UPSC
        upsc_subjects = [
            Subject(exam_id=upsc.id, name='General Studies', code='GS'),
            Subject(exam_id=upsc.id, name='CSAT', code='CSAT'),
        ]

        db.add_all(cbse_subjects + jee_subjects + upsc_subjects)
        db.flush()

        # Create sample chapters for CBSE Math
        math_subject = [s for s in cbse_subjects if s.name == 'Mathematics'][0]
        math_chapters = [
            Chapter(subject_id=math_subject.id, name='Algebra', weightage_marks=15, order_index=1),
            Chapter(subject_id=math_subject.id, name='Calculus', weightage_marks=20, order_index=2),
            Chapter(subject_id=math_subject.id, name='Trigonometry', weightage_marks=15, order_index=3),
            Chapter(subject_id=math_subject.id, name='Coordinate Geometry', weightage_marks=10, order_index=4),
            Chapter(subject_id=math_subject.id, name='Statistics', weightage_marks=10, order_index=5),
        ]

        # Create sample chapters for JEE Physics
        jee_physics = [s for s in jee_subjects if s.name == 'Physics'][0]
        physics_chapters = [
            Chapter(subject_id=jee_physics.id, name='Mechanics', weightage_marks=30, order_index=1),
            Chapter(subject_id=jee_physics.id, name='Thermodynamics', weightage_marks=15, order_index=2),
            Chapter(subject_id=jee_physics.id, name='Electromagnetism', weightage_marks=25, order_index=3),
            Chapter(subject_id=jee_physics.id, name='Optics', weightage_marks=15, order_index=4),
            Chapter(subject_id=jee_physics.id, name='Modern Physics', weightage_marks=15, order_index=5),
        ]

        db.add_all(math_chapters + physics_chapters)
        db.commit()

        print("✅ Sample data seeded successfully!")
        print(f"\n📊 Created:")
        print(f"   - {len([upsc, cbse, jee])} exams")
        print(f"   - {len(cbse_subjects + jee_subjects + upsc_subjects)} subjects")
        print(f"   - {len(math_chapters + physics_chapters)} chapters")
        print("\n🎯 Database is ready!")


if __name__ == "__main__":
    main()
