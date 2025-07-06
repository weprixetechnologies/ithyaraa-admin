// AddCategory.jsx
import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../layout';
import './category.css';
import CategoryTable from '../../components/category/categoryTable';
import Container from '../../components/ui/container';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import ImageUpload from '../../components/ui/imageUpload';

const AddCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [saveSteps, setSaveSteps] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const imageUploadRef = useRef();

    useEffect(() => {
        setTimeout(() => {
            setCategories((prev) => [
                ...prev,

                {
                    id: 'cat001',
                    name: 'Stationery',
                    image: 'https://picsum.photos/id/1035/300/200',
                    description: 'Stationery items',
                    slug: 'stationery'
                },
                {
                    id: 'cat002',
                    name: 'Art Supplies',
                    image: 'https://picsum.photos/id/1025/300/200',
                    description: 'Art tools and more',
                    slug: 'art-supplies'
                },
                {
                    id: 'cat003',
                    name: 'Books',
                    image: 'https://picsum.photos/id/1015/300/200',
                    description: 'Educational and leisure reading materials.',
                    slug: 'books'
                },
                {
                    id: 'cat004',
                    name: 'Craft Materials',
                    image: 'https://picsum.photos/id/1025/300/200',
                    description: 'Crafting papers, glues, and more.',
                    slug: 'craft-materials'
                },
                {
                    id: 'cat005',
                    name: 'Office Essentials',
                    image: 'https://picsum.photos/id/1005/300/200',
                    description: 'Items needed in any office setting.',
                    slug: 'office-essentials'
                },
                {
                    id: 'cat006',
                    name: 'Drawing Tools',
                    image: 'https://picsum.photos/id/1035/300/200',
                    description: 'Pencils, pens, erasers and rulers.',
                    slug: 'drawing-tools'
                },
                {
                    id: 'cat007',
                    name: 'Notebooks & Pads',
                    image: 'https://picsum.photos/id/1027/300/200',
                    description: 'All kinds of notebooks and writing pads.',
                    slug: 'notebooks-pads'
                },
                {
                    id: 'cat008',
                    name: 'Filing & Storage',
                    image: 'https://picsum.photos/id/1042/300/200',
                    description: 'Folders, files, and desk organizers.',
                    slug: 'filing-storage'
                },
                {
                    id: 'cat009',
                    name: 'School Kits',
                    image: 'https://picsum.photos/id/1001/300/200',
                    description: 'Complete kits for students.',
                    slug: 'school-kits'
                },
                {
                    id: 'cat010',
                    name: 'Writing Instruments',
                    image: 'https://picsum.photos/id/1055/300/200',
                    description: 'Pens, markers, and highlighters.',
                    slug: 'writing-instruments'
                }, {
                    id: 'cat011',
                    name: 'Whiteboards & Boards',
                    image: 'https://picsum.photos/id/1062/300/200',
                    description: 'Boards, markers, and erasers for presentations and classes.',
                    slug: 'whiteboards-boards'
                },
                {
                    id: 'cat012',
                    name: 'Adhesives & Tapes',
                    image: 'https://picsum.photos/id/1068/300/200',
                    description: 'Tapes, glues, and other adhesives for school and office use.',
                    slug: 'adhesives-tapes'
                },
                {
                    id: 'cat013',
                    name: 'Calculators',
                    image: 'https://picsum.photos/id/1070/300/200',
                    description: 'Basic and scientific calculators for students and professionals.',
                    slug: 'calculators'
                },
                {
                    id: 'cat014',
                    name: 'Envelopes & Mailing',
                    image: 'https://picsum.photos/id/1080/300/200',
                    description: 'Mailing supplies including envelopes, bubble wrap, and more.',
                    slug: 'envelopes-mailing'
                },
                {
                    id: 'cat015',
                    name: 'Bullet Journals',
                    image: 'https://picsum.photos/id/1084/300/200',
                    description: 'Stylish journals for creative note-taking and planning.',
                    slug: 'bullet-journals'
                },
                {
                    id: 'cat016',
                    name: 'Planners & Diaries',
                    image: 'https://picsum.photos/id/1081/300/200',
                    description: 'Organize your schedule with diaries, planners, and calendars.',
                    slug: 'planners-diaries'
                },
                {
                    id: 'cat017',
                    name: 'Desk Accessories',
                    image: 'https://picsum.photos/id/1083/300/200',
                    description: 'Keep your workspace tidy with premium desk accessories.',
                    slug: 'desk-accessories'
                },
                {
                    id: 'cat018',
                    name: 'Sticky Notes',
                    image: 'https://picsum.photos/id/109/300/200',
                    description: 'Colorful sticky notes for reminders and quick notes.',
                    slug: 'sticky-notes'
                },
                {
                    id: 'cat019',
                    name: 'Scissors & Cutters',
                    image: 'https://picsum.photos/id/110/300/200',
                    description: 'Tools to cut paper, crafts, and more with ease.',
                    slug: 'scissors-cutters'
                },
                {
                    id: 'cat020',
                    name: 'Measuring Tools',
                    image: 'https://picsum.photos/id/111/300/200',
                    description: 'Scales, measuring tapes, and rulers for accurate measurements.',
                    slug: 'measuring-tools'
                }

            ]);

            setLoading(false);
        }, 5000);
    }, []);

    const generateTimestampID = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        const now = new Date();
        const suffix = now
            .toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            .replace(/[^\d]/g, '');
        return `ITHY${random}-${suffix}`;
    };

    const generateSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');

    const addStep = async (text, delay = 400) => {
        setSaveSteps((prev) => [...prev, text]);
        await new Promise((res) => setTimeout(res, delay));
    };

    const resetForm = () => {
        setCategoryName('');
        setCategorySlug('');
        setCategoryID('');
        setCategoryDescription('');
        setSlugManuallyEdited(false);
        setEditingCategory(null);
        imageUploadRef.current?.resetImages?.();
    };

    const handleSave = async () => {
        setSaveSteps([]);
        setIsSaving(true);

        await addStep('🧠 Checking validation...');
        if (!categoryName) {
            alert('❌ Category Name is required');
            setIsSaving(false);
            return;
        }

        await addStep('🆔 Creating ID...');
        const finalID = editingCategory ? categoryID : generateTimestampID();
        if (!editingCategory) setCategoryID(finalID);

        await addStep('📤 Uploading image...');
        const imageUrls = await imageUploadRef.current.uploadImagetoDatabase();

        await addStep('🔌 Communicating backend...');
        const newCategory = {
            id: finalID,
            name: categoryName,
            slug: categorySlug || generateSlug(categoryName),
            description: categoryDescription,
            image: imageUrls[0]?.imgUrl || '',
        };

        await addStep(editingCategory ? '✏️ Updating category...' : '📬 Posting data...');
        setCategories((prev) => {
            if (editingCategory) {
                return prev.map((cat) => (cat.id === editingCategory.id ? newCategory : cat));
            } else {
                return [newCategory, ...prev];
            }
        });

        await addStep('✅ Completed!');
        setIsSaving(false);
        resetForm();
    };

    const handleEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setCategorySlug(cat.slug);
        setCategoryID(cat.id);
        setCategoryDescription(cat.description);
        imageUploadRef.current?.resetImages?.();
        imageUploadRef.current?.setPrefilledImage([
            { imgUrl: cat.image, imgAlt: '' }
        ]);
    };
    const handleUpdate = async () => {
        setSaveSteps([]);
        setIsSaving(true);

        try {
            // 1️⃣ Validation
            await addStep('🧠 Checking validation...');
            if (!categoryName || !categoryID) {
                alert('❌ Category Name and ID are required');
                setIsSaving(false);
                return;
            }

            // 2️⃣ Upload image(s)
            await addStep('📤 Uploading image...');
            const imageUrls = await imageUploadRef.current.uploadImagetoDatabase();

            // 3️⃣ Prepare data object
            await addStep('🧰 Preparing updated data...');
            const updatedCategory = {
                imgUrl: imageUrls[0]?.imgUrl || '',
                categoryName,
                categoryID,
                slug: categorySlug || generateSlug(categoryName),
                description: categoryDescription
            };

            console.log('📝 Updated category data to be sent:', updatedCategory);

            // 4️⃣ Communicate with backend
            await addStep('📡 Sending update request...');
            // await updateCategoryAPI(updatedCategory); // Implement this function with fetch/axios
            // uncomment the above one

            await addStep('✅ Update successful!');
            console.log('UPDATING DONE');
            console.log('UPDATED', updatedCategory);


            // 5️⃣ Clear editing state and reset form
            setEditingCategory(null);
            setCategoryName('');
            setCategorySlug('');
            setCategoryID('');
            setCategoryDescription('');
            setSaveSteps([])
            imageUploadRef.current?.resetImages?.();

        } catch (err) {
            console.error('❌ Error during update:', err);
            alert('Update failed. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };
    const updateCategoryAPI = async (category) => {
        const response = await fetch(`https://yourapi.com/categories/${category.categoryID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });

        if (!response.ok) {
            throw new Error('Failed to update category');
        }

        return await response.json();
    };

    return (
        <Layout active={'category-add'} title={'Add Category'}>
            <div className="category-page--wrap">
                <div className="add-category-left">
                    <Container gap={'15'} title={'Enter Category Data'}>
                        <InputCustomLabelled
                            label="Category Name"
                            placeholder={'Enter Category Name'}
                            value={categoryName}
                            inputFunction={(val) => {
                                setCategoryName(val);
                                if (!categoryID && val.trim().length === 1) {
                                    setCategoryID(generateTimestampID());
                                }
                                if (!slugManuallyEdited) {
                                    setCategorySlug(generateSlug(val));
                                }
                            }}
                        />
                        <InputCustomLabelled
                            label="Category Slug"
                            value={categorySlug}
                            placeholder={'Enter Category Slug'}
                            inputFunction={(val) => {
                                setCategorySlug(val);
                                setSlugManuallyEdited(true);
                            }}
                        />
                        <InputCustomLabelled
                            placeholder={'Enter Category ID - Recommended (auto-generate)'}
                            label="Category ID"
                            value={categoryID}
                            inputFunction={setCategoryID}
                        />
                        <InputCustomLabelled
                            placeholder={'Enter Category Description - Better SEO'}
                            label="Category Description"
                            isInput={false}
                            height={80}
                            value={categoryDescription}
                            inputFunction={setCategoryDescription}
                        />
                        <ImageUpload
                            layout="box"
                            ref={imageUploadRef}
                            placeholder="Drag or Click to Upload Image"
                            maxImages={1}
                        />
                        {editingCategory ? (
                            <button className="btn-class-category-page" onClick={handleUpdate} disabled={isSaving}>
                                {isSaving ? 'Updating...' : 'Update'}
                            </button>
                        ) : (
                            <button className="btn-class-category-page" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Processing...' : 'Save'}
                            </button>
                        )}

                        {saveSteps.length > 0 && (
                            <div className="save-status">
                                {saveSteps.map((step, i) => (
                                    <p key={i} style={{ margin: '5px 0', fontSize: '14px' }}>{step}</p>
                                ))}
                            </div>
                        )}
                    </Container>
                </div>
                <div className="all-category-right">
                    <CategoryTable
                        key={categories.length}
                        data={categories}
                        isLoading={loading}
                        onEdit={handleEditCategory}
                        onDelete={(data) =>
                            setCategories((prev) => prev.filter((cat) => cat.id !== data.id))
                        }
                    />

                </div>
            </div>
        </Layout>
    );
};

export default AddCategory;