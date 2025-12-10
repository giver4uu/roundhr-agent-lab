
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources: {
            en: {
                translation: {
                    app_title: "Ontology Manager",
                    export_json: "Export JSON",
                    auto_layout: "Auto Layout",

                    // Property Editor
                    properties_tab: "Properties",
                    rules_tab: "Rules & Logic",

                    // Properties Help
                    property_name: "Name",
                    property_type: "Type",
                    property_required: "Required",
                    add_property: "Add Property",

                    // Rules Help
                    add_rule: "Add Rule",
                    rule_type: "Rule Type",

                    // Tooltips / Descriptions
                    properties_help_title: "Properties Definition",
                    properties_help_desc: "Define the specific data attributes that belong to this class. Each property has a name and type (e.g., Text, Date).",

                    rules_help_title: "Logic Rules",
                    rules_help_desc: "Define constraints and relationships for this class.",

                    add_class: "Add Class",
                    delete_class: "Delete Class",
                    rule_cardinality: "Cardinality (N:M)",
                    rule_cardinality_desc: "Defines the numerical relationship between entities (e.g., One-to-One, One-to-Many).",

                    rule_disjoint: "Disjointness",
                    rule_disjoint_desc: "Specifies that an instance cannot belong to this class and another class simultaneously (Mutually Exclusive).",

                    rule_validation: "Validation",
                    rule_validation_desc: "Custom logic expression to validate data integrity (e.g., age > 18).",

                    description: "Description",
                    add_description: "Add description...",
                }
            },
            ko: {
                translation: {
                    app_title: "온톨로지 관리자",
                    export_json: "JSON 내보내기",
                    auto_layout: "자동 정렬",

                    // Property Editor
                    properties_tab: "속성 관리",
                    rules_tab: "규칙 및 로직",

                    // Properties Help
                    property_name: "이름",
                    property_type: "타입",
                    property_required: "필수 여부",
                    add_property: "속성 추가",

                    // Rules Help
                    add_rule: "규칙 추가",
                    rule_type: "규칙 유형",

                    // Tooltips / Descriptions
                    properties_help_title: "속성 정의",
                    properties_help_desc: "이 클래스에 속하는 구체적인 데이터 속성을 정의합니다. 각 속성은 이름과 타입(텍스트, 날짜 등)을 가집니다.",

                    rules_help_title: "로직 규칙",
                    rules_help_desc: "이 클래스에 대한 제약 조건과 관계를 정의합니다.",

                    add_class: "클래스 추가",
                    delete_class: "클래스 삭제",
                    rule_cardinality: "관계 수 (N:M)",
                    rule_cardinality_desc: "엔티티 간의 수적 관계를 정의합니다 (예: 1:1, 1:N).",

                    rule_disjoint: "배타성 (Disjointness)",
                    rule_disjoint_desc: "인스턴스가 이 클래스와 다른 클래스에 동시에 속할 수 없음을 명시합니다 (상호 배타).",

                    rule_validation: "유효성 검증 (Validation)",
                    rule_validation_desc: "데이터 무결성을 검증하기 위한 사용자 정의 논리 표현식입니다 (예: 나이 > 18).",

                    description: "설명",
                    add_description: "설명을 추가하세요...",
                }
            }
        },
        interpolation: {
            escapeValue: false, // React already safes from XSS
        }
    });

export default i18n;
