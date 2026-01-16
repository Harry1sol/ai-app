
import { ExamOption } from '../types';

export const EXAM_TAXONOMY: ExamOption[] = [
  {
    id: 'EXAM_NEET_PG',
    label: 'NEET PG',
    levels: [
      {
        id: 'LVL_NEET_GEN',
        label: 'General / All Years',
        subjects: [
          {
            id: 'SUB_ANATOMY',
            label: 'Anatomy',
            chapters: [
              { id: 'CH_OSTEOLOGY', label: 'Osteology' },
              { id: 'CH_NEUROANATOMY', label: 'Neuroanatomy' },
              { id: 'CH_THORAX', label: 'Thorax' },
              { id: 'CH_ABDOMEN', label: 'Abdomen & Pelvis' }
            ]
          },
          {
            id: 'SUB_PHYSIOLOGY',
            label: 'Physiology',
            chapters: [
              { id: 'CH_CVS', label: 'Cardiovascular System' },
              { id: 'CH_CNS', label: 'Central Nervous System' },
              { id: 'CH_RENAL', label: 'Renal Physiology' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'EXAM_CA_FOUNDATION',
    label: 'CA Foundation',
    levels: [
      {
        id: 'LVL_CA_STD',
        label: 'Standard',
        subjects: [
          {
            id: 'SUB_BUS_LAW',
            label: 'Business Laws',
            chapters: [
              { id: 'CH_ICA_1872', label: 'The Indian Contract Act, 1872' },
              { id: 'CH_SOGA_1930', label: 'The Sale of Goods Act, 1930' },
              { id: 'CH_IPA_1932', label: 'The Indian Partnership Act, 1932' },
              { id: 'CH_COMP_2013', label: 'The Companies Act, 2013' }
            ]
          },
          {
            id: 'SUB_ECONOMICS',
            label: 'Business Economics',
            chapters: [
              { id: 'CH_DEMAND_SUPPLY', label: 'Theory of Demand and Supply' },
              { id: 'CH_PROD_COST', label: 'Theory of Production and Cost' },
              { id: 'CH_MARKETS', label: 'Meaning and Types of Markets' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'EXAM_JEE_MAINS',
    label: 'JEE Mains',
    levels: [
      {
        id: 'LVL_CLASS_11',
        label: 'Class 11',
        subjects: [
          {
            id: 'SUB_PHYSICS_11',
            label: 'Physics',
            chapters: [
              { id: 'CH_KINEMATICS', label: 'Kinematics' },
              { id: 'CH_LAWS_MOTION', label: 'Laws of Motion' },
              { id: 'CH_THERMO', label: 'Thermodynamics' }
            ]
          }
        ]
      },
      {
        id: 'LVL_CLASS_12',
        label: 'Class 12',
        subjects: [
          {
            id: 'SUB_PHYSICS_12',
            label: 'Physics',
            chapters: [
              { id: 'CH_ELECTROSTATICS', label: 'Electrostatics' },
              { id: 'CH_OPTICS', label: 'Optics' },
              { id: 'CH_MODERN_PHYS', label: 'Modern Physics' }
            ]
          },
          {
            id: 'SUB_MATH_12',
            label: 'Mathematics',
            chapters: [
              { id: 'CH_CALCULUS', label: 'Calculus (Integration)' },
              { id: 'CH_VECTORS', label: 'Vectors & 3D Geometry' },
              { id: 'CH_PROBABILITY', label: 'Probability' }
            ]
          }
        ]
      }
    ]
  }
];
