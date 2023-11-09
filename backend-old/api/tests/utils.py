from users.models import User
from eduklub.models import (FavoriteList,
                            TeachingUnit,
                            Subject,
                            GradeType,
                            Grade,
                            Language)

def create_basic_data() -> tuple[User, GradeType, Grade, Subject, Language, TeachingUnit, TeachingUnit, FavoriteList]:
    author = User.objects.create_user(
        email='test@eduklub.cz',
        password='test',
    )

    grade_type = GradeType.objects.create(name='Gympl')

    grade = Grade.objects.create(name='1. třída', grade_type=grade_type)

    subject = Subject.objects.create(name='Matika')

    language = Language.objects.create(name='Čeština')

    teaching_unit = TeachingUnit.objects.create(
        name='Test teaching unit',
        author=author,
        grade=grade,
        subject=subject,
        language=language,
        number_of_lessons=1,
        number_of_downloads=1,
        certificated=True,
        zip_file='non-existent.zip',
    )
    teaching_unit2 = TeachingUnit.objects.create(
        name='Test teaching unit 2',
        author=author,
        grade=grade,
        subject=subject,
        language=language,
        number_of_lessons=2,
        number_of_downloads=2,
        is_recommended=True,
        zip_file='non-existent.zip',
    )

    favorite_list = FavoriteList.objects.create(
        name='Test list',
        author=author,
        is_main=False,
    )
    favorite_list.teaching_units.add(teaching_unit)
    favorite_list.teaching_units.add(teaching_unit2)
    favorite_list.save()

    return author, grade_type, grade, subject, language, teaching_unit, teaching_unit2, favorite_list
